import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, SinceCell, TextCell } from '../../framework';
import { RouteObj } from '../Routes';

export function useIdColumn<T extends { name: string; id: number }>() {
  const { t } = useTranslation();
  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Id'),
      cell: (team) => team.id,
      enabled: false,
      minWidth: 0,
      card: 'hidden',
      list: 'hidden',
    }),
    [t]
  );
  return column;
}

export function useNameColumn<T extends { name: string; id: number }>(options?: {
  header?: string;
  url?: string;
  onClick?: (item: T) => void;
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { url, onClick, disableSort, disableLinks } = options ?? {};
  const { t } = useTranslation();
  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: options?.header ?? t('Name'),
      cell: (item: T) => (
        <TextCell
          text={item.name}
          iconSize="sm"
          to={disableLinks ? undefined : url?.replace(':id', item.id.toString())}
          onClick={!disableLinks && onClick ? () => onClick?.(item) : undefined}
        />
      ),
      sort: disableSort ? undefined : 'name',
      card: 'name',
      list: 'name',
    }),
    [disableLinks, disableSort, onClick, options?.header, t, url]
  );
  return column;
}

export function useDescriptionColumn<T extends { description?: string | null | undefined }>() {
  const { t } = useTranslation();
  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Description'),
      type: 'description',
      value: (item) => item.description,
      list: 'secondary',
    }),
    [t]
  );
  return column;
}

export function useCreatedColumn(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const column: ITableColumn<
    | { created?: string }
    | { created?: string; summary_fields?: { created_by?: { id?: number; username?: string } } }
  > = useMemo(
    () => ({
      header: t('Created'),
      cell: (item) => {
        if (!item.created) return <></>;
        return (
          <SinceCell
            value={item.created}
            author={
              'summary_fields' in item ? item.summary_fields?.created_by?.username : undefined
            }
            onClick={
              options?.disableLinks || !('summary_fields' in item)
                ? undefined
                : () =>
                    navigate(
                      RouteObj.UserDetails.replace(
                        ':id',
                        (item.summary_fields?.created_by?.id ?? 0).toString()
                      )
                    )
            }
          />
        );
      },
      sort: options?.disableSort ? undefined : 'created',
      defaultSortDirection: 'desc',
      card: 'hidden',
      list: 'secondary',
    }),
    [navigate, options?.disableLinks, options?.disableSort, t]
  );
  return column;
}

export function useModifiedColumn(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const history = useNavigate();
  const column: ITableColumn<
    | { modified?: string }
    | {
        modified?: string;
        summary_fields?: { modified_by?: { id?: number; username?: string } };
      }
  > = useMemo(
    () => ({
      header: t('Modified'),
      cell: (item) => {
        if (!item.modified) return <></>;
        return (
          <SinceCell
            value={item.modified}
            author={
              'summary_fields' in item ? item.summary_fields?.modified_by?.username : undefined
            }
            onClick={
              options?.disableLinks || !('summary_fields' in item)
                ? undefined
                : () =>
                    history(
                      RouteObj.UserDetails.replace(
                        ':id',
                        (item.summary_fields?.modified_by?.id ?? 0).toString()
                      )
                    )
            }
          />
        );
      },
      sort: options?.disableSort ? undefined : 'modified',
      defaultSortDirection: 'desc',
      card: 'hidden',
      list: 'secondary',
    }),
    [history, options?.disableLinks, options?.disableSort, t]
  );
  return column;
}

export function useOrganizationNameColumn(options?: {
  disableLinks?: boolean;
  disableSort?: boolean;
}) {
  const { t } = useTranslation();
  const column: ITableColumn<{
    summary_fields?: {
      organization?: {
        id: number;
        name: string;
      };
    };
  }> = useMemo(
    () => ({
      header: t('Organization'),
      cell: (item) => (
        <TextCell
          text={item.summary_fields?.organization?.name}
          to={RouteObj.OrganizationDetails.replace(
            ':id',
            (item.summary_fields?.organization?.id ?? '').toString()
          )}
          disableLinks={options?.disableLinks}
        />
      ),
      sort: options?.disableSort ? undefined : 'organization',
    }),
    [options?.disableLinks, options?.disableSort, t]
  );
  return column;
}
export function useTypeColumn(options?: {
  header?: string;
  url?: string;
  disableSort?: boolean;
  disableLinks?: boolean;
  makeReadable: (type: string) => string;
}) {
  const { t } = useTranslation();
  const column: ITableColumn<{ type?: string }> = useMemo(
    () => ({
      header: t('Type'),
      cell: (item) => {
        if (!item.type) return <></>;
        return <TextCell text={options?.makeReadable(item.type)} />;
      },
      sort: options?.disableSort ? undefined : 'type',
      defaultSortDirection: 'desc',
      card: 'hidden',
      list: 'secondary',
    }),
    [t, options]
  );
  return column;
}
