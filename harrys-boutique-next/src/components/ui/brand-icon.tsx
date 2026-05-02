import {
  AlertTriangle,
  Bed,
  Camera,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  CreditCard,
  DollarSign,
  Download,
  Edit2,
  Eye,
  ExternalLink,
  FileText,
  Filter,
  Gamepad2,
  Gift,
  Handshake,
  Heart,
  ImageIcon,
  Leaf,
  LayoutDashboard,
  LogOut,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Palette,
  PawPrint,
  Phone,
  Ruler,
  Save,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Shirt,
  Sparkles,
  Star,
  Tag,
  Target,
  Trash2,
  Truck,
  Utensils,
  Users,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

export type BrandIconName =
  | 'alert'
  | 'bed'
  | 'camera'
  | 'check'
  | 'check-circle'
  | 'chevron-left'
  | 'chevron-right'
  | 'circle'
  | 'coupon'
  | 'design'
  | 'download'
  | 'edit'
  | 'external-link'
  | 'eye'
  | 'food'
  | 'filter'
  | 'gift'
  | 'handshake'
  | 'heart'
  | 'image'
  | 'leaf'
  | 'layout-dashboard'
  | 'logout'
  | 'loader'
  | 'location'
  | 'message'
  | 'package'
  | 'paw'
  | 'payment'
  | 'phone'
  | 'price'
  | 'review'
  | 'ruler'
  | 'save'
  | 'search'
  | 'settings'
  | 'shopping-bag'
  | 'shipping'
  | 'shirt'
  | 'sparkles'
  | 'star'
  | 'target'
  | 'tag'
  | 'toy'
  | 'trash'
  | 'users'
  | 'x'
  | 'x-circle'

const icons: Record<BrandIconName, LucideIcon> = {
  alert: AlertTriangle,
  bed: Bed,
  camera: Camera,
  check: Check,
  'check-circle': CheckCircle,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  circle: Circle,
  coupon: Gift,
  design: Palette,
  download: Download,
  edit: Edit2,
  'external-link': ExternalLink,
  eye: Eye,
  food: Utensils,
  filter: Filter,
  gift: Gift,
  handshake: Handshake,
  heart: Heart,
  image: ImageIcon,
  leaf: Leaf,
  'layout-dashboard': LayoutDashboard,
  logout: LogOut,
  loader: Loader2,
  location: MapPin,
  message: MessageSquare,
  package: Package,
  paw: PawPrint,
  payment: CreditCard,
  phone: Phone,
  price: DollarSign,
  review: FileText,
  ruler: Ruler,
  save: Save,
  search: Search,
  settings: Settings,
  'shopping-bag': ShoppingBag,
  shipping: Truck,
  shirt: Shirt,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  tag: Tag,
  toy: Gamepad2,
  trash: Trash2,
  users: Users,
  x: X,
  'x-circle': XCircle,
}

interface BrandIconProps {
  name: BrandIconName
  className?: string
  strokeWidth?: number
}

export function BrandIcon({ name, className = 'h-5 w-5', strokeWidth = 2 }: BrandIconProps) {
  const Icon = icons[name]
  return <Icon aria-hidden="true" className={className} strokeWidth={strokeWidth} />
}
