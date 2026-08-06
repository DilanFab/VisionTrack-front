import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowRight,
  faAt,
  faBars,
  faBarsStaggered,
  faBell,
  faCalendar,
  faCalendarCheck,
  faCalendarDays,
  faCalendarXmark,
  faChartLine,
  faChartSimple,
  faChevronRight,
  faCircleCheck,
  faCircleExclamation,
  faCirclePlus,
  faCloudArrowUp,
  faEye,
  faEyeSlash,
  faFileMedical,
  faFolderOpen,
  faGaugeHigh,
  faHourglassHalf,
  faLock,
  faMagnifyingGlass,
  faMicroscope,
  faMoon,
  faNotesMedical,
  faPalette,
  faPlus,
  faRightFromBracket,
  faShield,
  faShieldHalved,
  faSpinner,
  faStethoscope,
  faSun,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const iconMap: Record<string, IconDefinition> = {
  add: faPlus,
  add_circle: faCirclePlus,
  alternate_email: faAt,
  analytics: faChartSimple,
  arrow_forward: faArrowRight,
  biotech: faMicroscope,
  calendar_month: faCalendarDays,
  check_circle: faCircleCheck,
  chevron_right: faChevronRight,
  close: faXmark,
  cloud_done: faCloudArrowUp,
  dark_mode: faMoon,
  error: faCircleExclamation,
  event_available: faCalendarCheck,
  event_busy: faCalendarXmark,
  event_note: faCalendar,
  folder_shared: faFolderOpen,
  history_edu: faFileMedical,
  hourglass_top: faHourglassHalf,
  light_mode: faSun,
  lock: faLock,
  logout: faRightFromBracket,
  menu: faBars,
  menu_open: faBarsStaggered,
  notifications: faBell,
  palette: faPalette,
  person: faUser,
  progress_activity: faSpinner,
  routine: faStethoscope,
  search: faMagnifyingGlass,
  security: faShieldHalved,
  speed: faGaugeHigh,
  task_alt: faCircleCheck,
  trending_up: faChartLine,
  verified_user: faShield,
  visibility: faEye,
  visibility_off: faEyeSlash,
};

interface SymbolIconProps {
  name: string;
  className?: string;
  fixedWidth?: boolean;
}

export const SymbolIcon = ({ name, className, fixedWidth = true }: SymbolIconProps) => (
  <FontAwesomeIcon
    icon={iconMap[name] ?? faNotesMedical}
    className={className}
    fixedWidth={fixedWidth}
    spin={name === "progress_activity"}
    aria-hidden="true"
  />
);
