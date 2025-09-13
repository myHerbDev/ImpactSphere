import type { NavItem } from './types';
import { DashboardIcon, LibraryIcon, ChallengesIcon, ReportingIcon, DataEntryIcon, AssessmentIcon } from './components/Icons';

export const NAV_ITEMS: NavItem[] = [
  { name: 'Impact Dashboard', icon: <DashboardIcon /> },
  { name: 'ESG Playbook', icon: <LibraryIcon /> },
  { name: 'Initiatives', icon: <ChallengesIcon /> },
  { name: 'ESG Assessment', icon: <AssessmentIcon /> },
  { name: 'Data Entry', icon: <DataEntryIcon /> },
  { name: 'Reporting', icon: <ReportingIcon /> },
];