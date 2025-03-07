import { Static, Type } from '@sinclair/typebox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../../framework';
import { PageFormSchema } from '../../../../framework/PageForm/PageFormSchema';
import { useInvalidateCacheOnUnmount } from '../../../common/useInvalidateCache';
import { useGet } from '../../../common/useItem';
import { requestPatch, requestPost } from '../../../Data';
import { RouteObj } from '../../../Routes';
import { EdaUser } from '../../interfaces/EdaUser';
import { API_PREFIX } from '../../constants';

export function EditUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: User } = useGet<EdaUser>(`${API_PREFIX}/users/${id.toString()}/`);

  const UserSchemaType = useMemo(
    () =>
      Type.Object({
        name: Type.String({
          title: t('Name'),
          placeholder: t('Enter the name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }),
        url: Type.Optional(
          Type.String({
            title: t('URL'),
            placeholder: t('Enter the URL'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          })
        ),
      }),
    [t]
  );

  type UserSchema = Static<typeof UserSchemaType>;

  useInvalidateCacheOnUnmount();

  const onSubmit: PageFormSubmitHandler<UserSchema> = async (User, setError) => {
    try {
      if (Number.isInteger(id)) {
        User = await requestPatch<EdaUser>(`${API_PREFIX}/users/${id}/`, User);
        navigate(-1);
      } else {
        const newUser = await requestPost<EdaUser>(`${API_PREFIX}/users/`, User);
        navigate(RouteObj.EdaUserDetails.replace(':id', newUser.id.toString()));
      }
    } catch (err) {
      setError('TODO');
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!User) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[{ label: t('Users'), to: RouteObj.EdaUsers }, { label: t('Edit User') }]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit User')}
            breadcrumbs={[{ label: t('Users'), to: RouteObj.EdaUsers }, { label: t('Edit User') }]}
          />
          <PageForm
            schema={UserSchemaType}
            submitText={t('Save User')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={User}
          >
            <PageFormSchema schema={UserSchemaType} />
          </PageForm>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create User')}
          breadcrumbs={[{ label: t('Users'), to: RouteObj.EdaUsers }, { label: t('Create User') }]}
        />
        <PageForm
          schema={UserSchemaType}
          submitText={t('Create User')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        >
          <PageFormSchema schema={UserSchemaType} />
        </PageForm>
      </PageLayout>
    );
  }
}
