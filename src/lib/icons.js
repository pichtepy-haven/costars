import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BellOff, Calendar, Camera, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, Clock, Coffee, Crown, DoorOpen, Drum, Guitar, Heart, HeartHandshake, Info,
  MapPin, Mic, MicVocal, MoveHorizontal, Music, Phone, Piano, Radio, Send, Star, Ticket, X,
} from 'lucide-react'

/** Icon names that can be used in the content (data.js / Google Sheet). */
const ICONS = {
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'bell-off': BellOff,
  'phone-off': BellOff,
  aisle: MoveHorizontal,
  calendar: Calendar,
  camera: Camera,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  help: CircleHelp,
  clock: Clock,
  coffee: Coffee,
  crown: Crown,
  door: DoorOpen,
  drum: Drum,
  guitar: Guitar,
  heart: Heart,
  'heart-handshake': HeartHandshake,
  info: Info,
  'map-pin': MapPin,
  mic: Mic,
  'mic-vocal': MicVocal,
  music: Music,
  phone: Phone,
  piano: Piano,
  radio: Radio,
  send: Send,
  star: Star,
  ticket: Ticket,
  x: X,
}

export const getIcon = (name) => ICONS[name] || Music
