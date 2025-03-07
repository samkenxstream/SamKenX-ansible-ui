import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { useActiveUser } from '../../../common/useActiveUser';
import { requestPost } from '../../../Data';
import { User } from '../../interfaces/User';
import { useUsersColumns } from '../users/hooks/useUsersColumns';
import { ResourceType } from './ResourceAccessList';

export function useRemoveUsersFromResource(resource: ResourceType) {
  const { t } = useTranslation();

  const activeUser = useActiveUser();
  const canRemoveUsers: boolean = useMemo(
    () => activeUser?.is_superuser || resource?.summary_fields?.user_capabilities?.edit,
    [activeUser?.is_superuser, resource?.summary_fields?.user_capabilities?.edit]
  );

  const cannotRemoveUser = useCallback(
    (user: User) => {
      if (user.is_superuser) {
        return t('System administrators have unrestricted access to all resources.');
      }
      if (user.is_system_auditor) {
        return t('System auditors have read access to all resources.');
      }
      if (!canRemoveUsers) {
        return t('The user cannot be deleted due to insufficient permissions.');
      }
      return undefined;
    },
    [canRemoveUsers, t]
  );

  const title = useMemo(() => {
    const titleMap: { [key: string]: string } = {
      organization: 'Remove user from organization',
      team: 'Remove user from team',
      // TODO: Expand map for other resource types
    };
    return resource.type ? titleMap[resource.type] : 'Remove user';
  }, [resource.type]);

  const confirmationColumns = useUsersColumns();
  const removeUserConfirmationDialog = useBulkConfirmation<User>();

  const removeUsersFromResource = useCallback(
    (users: User[], onComplete?: (users: User[]) => void) => {
      const undeletableUsers = users.filter(cannotRemoveUser);

      removeUserConfirmationDialog({
        title: t(title, { count: users.length }),
        confirmText: t('Yes, I confirm that I want to remove these {{count}} users.', {
          count: users.length - undeletableUsers.length,
        }),
        actionButtonText: t('Remove user', { count: users.length }),
        items: users.sort((l, r) => compareStrings(l.username, r.username)),
        keyFn: (user: User) => user.id,
        alertPrompts:
          undeletableUsers.length > 0
            ? [
                t(
                  '{{count}} of the selected users cannot be deleted due to insufficient permissions.',
                  {
                    count: undeletableUsers.length,
                  }
                ),
              ]
            : undefined,
        isItemNonActionable: cannotRemoveUser,
        isDanger: true,
        confirmationColumns,
        actionColumns: [{ header: 'User', cell: (user: User) => user.username }],
        onComplete,
        actionFn: async (user: User, signal: AbortSignal) => {
          if (user.user_roles) {
            for (const role of user.user_roles) {
              await requestPost(
                `/api/v2/users/${user.id.toString()}/roles/`,
                { id: role.id, disassociate: true },
                signal
              );
            }
          }
        },
      });
    },
    [cannotRemoveUser, confirmationColumns, removeUserConfirmationDialog, t, title]
  );
  return removeUsersFromResource;
}
