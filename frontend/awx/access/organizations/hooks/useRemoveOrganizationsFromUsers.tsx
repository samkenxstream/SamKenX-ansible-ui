import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkActionDialog } from '../../../../../framework/BulkActionDialog';
import { requestPost } from '../../../../Data';
import { Organization } from '../../../interfaces/Organization';
import { User } from '../../../interfaces/User';

export function useRemoveOrganizationsFromUsers() {
  const { t } = useTranslation();
  const organizationProgressDialog = useBulkActionDialog<Organization>();
  const removeUserToOrganizations = useCallback(
    (
      users: User[],
      organizations: Organization[],
      onComplete?: (organizations: Organization[]) => void
    ) => {
      organizationProgressDialog({
        title: t('Removing user from organizations', {
          count: organizations.length,
        }),
        keyFn: (organization: Organization) => organization.id,
        items: organizations,
        actionColumns: [
          { header: 'Organization', cell: (organization: Organization) => organization.name },
        ],
        actionFn: async (organization: Organization, signal: AbortSignal) => {
          for (const user of users) {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: organization.summary_fields.object_roles.member_role.id, disassociate: true },
              signal
            );
          }
        },
        processingText: t('Removing user from organizations...', {
          count: organizations.length,
        }),
        onComplete,
      });
    },
    [organizationProgressDialog, t]
  );
  return removeUserToOrganizations;
}
