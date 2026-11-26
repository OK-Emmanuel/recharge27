import type { ComponentProps } from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Activity01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
  Briefcase01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  CircleIcon as HugeCircleIcon,
  Comment01Icon,
  Download01Icon,
  File01Icon,
  FolderOpenIcon,
  Home01Icon,
  Image01Icon,
  LinkSquare02Icon,
  Logout01Icon,
  Megaphone01Icon,
  Menu01Icon,
  Message01Icon,
  Notification01Icon,
  PlusSignIcon,
  Search01Icon,
  SentIcon,
  SlidersHorizontalIcon,
  StarIcon,
  Target01Icon,
  TestTube01Icon,
  Tick02Icon,
  UserIcon,
  UserMultiple02Icon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons"

type IconProps = Omit<ComponentProps<typeof HugeiconsIcon>, "icon">

// Admin and portal icon set, expressed in Hugeicons so the whole site shares one visual language.
const make = (icon: IconSvgElement) =>
  function Glyph(props: IconProps) {
    return <HugeiconsIcon icon={icon} strokeWidth={1.75} {...props} />
  }

export const Activity = make(Activity01Icon)
export const ArrowDown = make(ArrowDown01Icon)
export const ArrowLeft = make(ArrowLeft01Icon)
export const ArrowUp = make(ArrowUp01Icon)
export const ArrowUpDown = make(ArrowUpDownIcon)
export const Bell = make(Notification01Icon)
export const Briefcase = make(Briefcase01Icon)
export const Check = make(Tick02Icon)
export const CheckCircle = make(CheckmarkCircle02Icon)
export const ChevronDown = make(ArrowDown01Icon)
export const ChevronLeft = make(ArrowLeft01Icon)
export const ChevronRight = make(ArrowRight01Icon)
export const ChevronUp = make(ArrowUp01Icon)
export const Circle = make(HugeCircleIcon)
export const Download = make(Download01Icon)
export const ExternalLink = make(LinkSquare02Icon)
export const FileText = make(File01Icon)
export const FlaskConical = make(TestTube01Icon)
export const FolderOpen = make(FolderOpenIcon)
export const Home = make(Home01Icon)
export const ImageGlyph = make(Image01Icon)
export const LogOut = make(Logout01Icon)
export const Megaphone = make(Megaphone01Icon)
export const Menu = make(Menu01Icon)
export const MessageCircle = make(Comment01Icon)
export const MessageSquare = make(Message01Icon)
export const Plus = make(PlusSignIcon)
export const Search = make(Search01Icon)
export const Send = make(SentIcon)
export const SlidersHorizontal = make(SlidersHorizontalIcon)
export const Star = make(StarIcon)
export const Target = make(Target01Icon)
export const User = make(UserIcon)
export const UserX = make(UserRemove01Icon)
export const Users = make(UserMultiple02Icon)
export const X = make(Cancel01Icon)
