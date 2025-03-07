import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
} from '../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '../../../common/columns';
import { RouteObj } from '../../../Routes';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
  useOrganizationToolbarFilter,
} from '../../common/awx-toolbar-filters';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import { useAwxView } from '../../useAwxView';

import { useDeleteExecutionEnvironments } from './hooks/useDeleteExecutionEnvironments';

export function ExecutionEnvironments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useExecutionEnvironmentsFilters();
  const tableColumns = useExecutionEnvironmentsColumns();
  const view = useAwxView<ExecutionEnvironment>({
    url: '/api/v2/execution_environments/',
    toolbarFilters,
    tableColumns,
  });
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create execution environment'),
        onClick: () => navigate(RouteObj.CreateExecutionEnvironment),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected execution environments'),
        onClick: deleteExecutionEnvironments,
        isDanger: true,
      },
    ],
    [navigate, deleteExecutionEnvironments, t]
  );

  const rowActions = useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit execution environment'),
        onClick: (executionEnvironment) =>
          navigate(
            RouteObj.EditExecutionEnvironment.replace(':id', executionEnvironment.id.toString())
          ),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete execution environment'),
        onClick: (executionEnvironment) => deleteExecutionEnvironments([executionEnvironment]),
        isDanger: true,
      },
    ],
    [navigate, deleteExecutionEnvironments, t]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Execution environments')}
        titleHelpTitle={t('Execution environments')}
        titleHelp={t('executionEnvironments.title.help')}
        titleDocLink="https://docs.ansible.com/automation-controller/latest/html/userguide/execution_environments.html"
        description={t('executionEnvironments.title.description')}
      />
      <PageTable<ExecutionEnvironment>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading execution environments')}
        emptyStateTitle={t('No execution environments yet')}
        emptyStateDescription={t('To get started, create an execution environment.')}
        emptyStateButtonText={t('Create execution environment')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateExecutionEnvironment)}
        {...view}
      />
    </PageLayout>
  );
}

export function useExecutionEnvironmentsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const organizationToolbarFilter = useOrganizationToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      organizationToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [
      nameToolbarFilter,
      descriptionToolbarFilter,
      organizationToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ]
  );
  return toolbarFilters;
}

export function useExecutionEnvironmentsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const nameClick = useCallback(
    (executionEnvironment: ExecutionEnvironment) =>
      navigate(
        RouteObj.ExecutionEnvironmentDetails.replace(':id', executionEnvironment.id.toString())
      ),
    [navigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const descriptionColumn = useDescriptionColumn();
  const organizationColumn = useOrganizationNameColumn(options);
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<ExecutionEnvironment>[]>(
    () => [
      nameColumn,
      descriptionColumn,
      {
        header: t('Image'),
        cell: (executionEnvironment) => executionEnvironment.image,
      },
      organizationColumn,
      createdColumn,
      modifiedColumn,
    ],
    [nameColumn, descriptionColumn, t, organizationColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
