import { NavExpandable, NavItem } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../framework';
import { CommonSidebar } from '../common/CommonSidebar';
import { isRouteActive } from '../common/Masthead';
import { RouteObj, RouteType } from '../Routes';

export function EventDrivenSidebar(props: {
  isNavOpen: boolean;
  setNavOpen: (open: boolean) => void;
}) {
  const { isNavOpen, setNavOpen } = props;
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isXl = useBreakpoint('xl');
  const onClick = useCallback(
    (route: RouteType) => {
      navigate(route);
      if (!isXl) setNavOpen(false);
    },
    [navigate, isXl, setNavOpen]
  );
  return (
    <CommonSidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen}>
      <NavItem
        isActive={isRouteActive(RouteObj.EdaDashboard, location)}
        onClick={() => onClick(RouteObj.EdaDashboard)}
      >
        {t('Dashboard')}
      </NavItem>
      <NavExpandable
        key="resources"
        title={t('Resources')}
        isExpanded
        isActive={isRouteActive(
          [RouteObj.EdaProjects, RouteObj.EdaExecutionEnvironments, RouteObj.EdaInventories],
          location
        )}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.EdaProjects, location)}
          onClick={() => onClick(RouteObj.EdaProjects)}
        >
          {t('Projects')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.EdaExecutionEnvironments, location)}
          onClick={() => onClick(RouteObj.EdaExecutionEnvironments)}
        >
          {t('Execution environments')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.EdaInventories, location)}
          onClick={() => onClick(RouteObj.EdaInventories)}
        >
          {t('Inventories')}
        </NavItem>
      </NavExpandable>
      <NavExpandable
        key="views"
        title={t('Views')}
        isExpanded
        isActive={isRouteActive([RouteObj.EdaActions, RouteObj.EdaRulebookActivations], location)}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.EdaActions, location)}
          onClick={() => onClick(RouteObj.EdaActions)}
        >
          {t('Actions')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.EdaRulebookActivations, location)}
          onClick={() => onClick(RouteObj.EdaRulebookActivations)}
        >
          {t('Rulebook activations')}
        </NavItem>
      </NavExpandable>
      <NavItem
        isActive={isRouteActive(RouteObj.EdaActivities, location)}
        onClick={() => onClick(RouteObj.EdaActivities)}
      >
        {t('Activities')}
      </NavItem>
      <NavItem
        isActive={isRouteActive(RouteObj.EdaRulebooks, location)}
        onClick={() => onClick(RouteObj.EdaRulebooks)}
      >
        {t('Rulebooks')}
      </NavItem>
      <NavItem
        isActive={isRouteActive(RouteObj.EdaRules, location)}
        onClick={() => onClick(RouteObj.EdaRules)}
      >
        {t('Rules')}
      </NavItem>
      <NavExpandable
        key="user"
        title={t('User Access')}
        isExpanded
        isActive={isRouteActive(
          [RouteObj.EdaUsers, RouteObj.EdaGroups, RouteObj.EdaRoles],
          location
        )}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.EdaUsers, location)}
          onClick={() => onClick(RouteObj.EdaUsers)}
        >
          {t('Users')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.EdaGroups, location)}
          onClick={() => onClick(RouteObj.EdaGroups)}
        >
          {t('Groups')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.EdaRoles, location)}
          onClick={() => onClick(RouteObj.EdaRoles)}
        >
          {t('Roles')}
        </NavItem>
      </NavExpandable>
    </CommonSidebar>
  );
}
