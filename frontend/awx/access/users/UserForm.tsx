/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  PageForm,
  PageFormSelectOption,
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet, requestPatch, requestPost, swrOptions } from '../../../Data';
import { RouteObj } from '../../../Routes';
import { Organization } from '../../interfaces/Organization';
import { User } from '../../interfaces/User';
import { getAwxError } from '../../useAwxView';
import { useSelectOrganization } from '../organizations/hooks/useSelectOrganization';

export function CreateUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onSubmit: PageFormSubmitHandler<IUserInput> = async (
    userInput,
    setError,
    setFieldError
  ) => {
    const { user, userType, confirmPassword, organization } = userInput;
    try {
      user.is_superuser = userType === t('System administrator');
      user.is_system_auditor = userType === t('System auditor');
      if (confirmPassword !== user.password) {
        setFieldError('confirmPassword', { message: t('Password does not match.') });
        return false;
      }
      const newUser = await requestPost<User>(
        `/api/v2/organizations/${organization.toString()}/users/`,
        user
      );
      navigate(RouteObj.UserDetails.replace(':id', newUser.id.toString()));
    } catch (err) {
      setError(await getAwxError(err));
    }
  };

  const onCancel = () => navigate(-1);

  return (
    <>
      <PageHeader
        title={t('Create user')}
        breadcrumbs={[{ label: t('Users'), to: RouteObj.Users }, { label: t('Create user') }]}
      />
      <PageForm
        submitText={t('Create user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ userType: 'Normal user' }}
      >
        <UserInputs mode="create" />
      </PageForm>
    </>
  );
}

export function EditUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: user } = useSWR<User>(`/api/v2/users/${id.toString()}/`, requestGet, swrOptions);

  const onSubmit: PageFormSubmitHandler<IUserInput> = async (
    userInput: IUserInput,
    setError,
    setFieldError
  ) => {
    const { user, userType, confirmPassword } = userInput;
    try {
      user.is_superuser = userType === t('System administrator');
      user.is_system_auditor = userType === t('System auditor');
      if (user.password) {
        if (confirmPassword !== user.password) {
          setFieldError('confirmPassword', { message: t('Password does not match.') });
          return false;
        }
      }
      const newUser = await requestPatch<User>(`/api/v2/users/${id}/`, user);
      navigate(RouteObj.UserDetails.replace(':id', newUser.id.toString()));
    } catch (err) {
      setError(await getAwxError(err));
    }
  };

  const onCancel = () => navigate(-1);

  if (!user) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[{ label: t('Users'), to: RouteObj.Users }, { label: t('Edit user') }]}
        />
      </PageLayout>
    );
  }

  const defaultValue: Partial<IUserInput> = {
    user: user,
    userType: user.is_superuser
      ? 'System administrator'
      : user.is_system_auditor
      ? 'System auditor'
      : 'Normal user',
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit user')}
        breadcrumbs={[{ label: t('Users'), to: RouteObj.Users }, { label: t('Edit user') }]}
      />
      <PageForm<IUserInput>
        submitText={t('Save user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={defaultValue}
      >
        <UserInputs mode="edit" />
      </PageForm>
    </PageLayout>
  );
}

interface IUserInput {
  user: User;
  userType: string;
  confirmPassword: string;
  organization: number;
}

function UserInputs(props: { mode: 'create' | 'edit' }) {
  const { mode } = props;
  const { setValue } = useFormContext();
  const { t } = useTranslation();
  const selectOrganization = useSelectOrganization();
  return (
    <>
      <PageFormTextInput
        name="user.username"
        label={t('Username')}
        placeholder={t('Enter username')}
        isRequired
        maxLength={150}
        autoComplete="new-username"
        validate={(username: string) => {
          for (const c of username) {
            if (
              !'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890@.+-_'.includes(c)
            ) {
              return t('Username may contain only letters, numbers, and @.+-_ characters.');
            }
          }
        }}
      />
      <PageFormSelectOption
        name="userType"
        label={t('User type')}
        placeholderText={t('Select user type')}
        options={[
          {
            label: t('System administrator'),
            description: t('can edit, change, and update any inventory or automation definition'),
            value: 'System administrator',
          },
          {
            label: t('System auditor'),
            description: t(
              'can see all aspects of the systems automation, but has no permission to run or change automation'
            ),
            value: 'System auditor',
          },
          {
            label: t('Normal user'),
            description: t(
              'has read and write access limited to the resources (such as inventory, projects, and job templates) for which that user has been granted the appropriate roles and privileges'
            ),
            value: 'Normal user',
          },
        ]}
        isRequired
      />
      {mode === 'create' && (
        <PageFormTextInput
          label="Organization"
          name="user.summary_fields.organization.name"
          placeholder="Enter organization"
          selectTitle={t('Select an organization')}
          selectValue={(organization: Organization) => organization.name}
          selectOpen={selectOrganization}
          validate={async (organizationName: string) => {
            try {
              const itemsResponse = await requestGet<ItemsResponse<Organization>>(
                `/api/v2/organizations/?name=${organizationName}`
              );
              if (itemsResponse.results.length === 0) return t('Organization not found.');
              setValue('organization', itemsResponse.results[0].id);
            } catch (err) {
              if (err instanceof Error) return err.message;
              else return 'Unknown error';
            }
            return undefined;
          }}
          isRequired
        />
      )}
      <PageFormTextInput
        name="user.password"
        label={t('Password')}
        placeholder={t('Enter password')}
        type="password"
        autoComplete="new-password"
        isRequired={mode === 'create'}
      />
      <PageFormTextInput
        name="confirmPassword"
        label={t('Confirm password')}
        placeholder={t('Enter password')}
        type="password"
        autoComplete="new-password"
        isRequired={mode === 'create'}
      />
      <PageFormTextInput
        name="user.firstName"
        label={t('First name')}
        placeholder={t('Enter first name')}
        maxLength={150}
      />
      <PageFormTextInput
        name="user.lastName"
        label={t('Last name')}
        placeholder={t('Enter last name')}
        maxLength={150}
      />
      <PageFormTextInput name="user.email" label={t('Email')} placeholder={t('Enter email')} />
    </>
  );
}
