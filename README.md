# Staybridge London - Premium Accommodation Platform

<!-- Project version: STAYBRIDGE CATALOGO.v1 -->

A modern, responsive real estate catalog platform for connecting Brazilian customers with quality accommodation in London.

## 🎨 Design System

### Color Palette
- **Primary Green**: `#1a4d2e` - Main brand color
- **Medium Green**: `#2d5a3d` - Hover states
- **Yellow**: `#f4d03f` - Accent color and CTAs
- **Black**: `#0a0a0a` - Text and contrast
- **White**: `#ffffff` - Typography and cards

### Visual Identity
- Premium real estate aesthetic
- London night theme (Big Ben hero image)
- Promotional style with diagonal sections
- Modern card layouts with soft shadows
- Bold typography with high contrast
- Conversion-focused design

## 📱 Features

### Pages
1. **Home Page** (`/`)
   - Hero section with London skyline
   - Featured properties carousel
   - Benefits section with stats
   - "How it Works" 4-step guide
   - Testimonials from Brazilian tenants
   - WhatsApp CTA section

2. **Property Listing** (`/properties`)
   - Grid layout with responsive cards
   - Advanced filters sidebar (desktop)
   - Mobile filter drawer
   - Region filters (North/South/East/West/Central London)
   - Property type filters (Studio/Ensuite/Flat/Single/Double)
   - Price range filters
   - Bills included toggle
   - Immediate move-in filter

3. **Property Details** (`/property/:id`)
   - Image gallery with navigation
   - Thumbnail gallery
   - Full property description
   - Amenities list
   - Nearby transport stations
   - Location map placeholder
   - Pricing breakdown (weekly rent + deposit)
   - Sticky WhatsApp CTA (desktop & mobile)
   - Favorite and share buttons

4. **Favorites** (`/favorites`)
   - Saved properties placeholder
   - Empty state with CTA

5. **Profile** (`/profile`)
   - Customer area information
   - Service overview
   - Contact options

### Components

#### Navigation
- **Header**: Fixed navigation with transparency on scroll, mobile menu
- **MobileBottomNav**: Sticky bottom navigation for mobile (Home, Search, Favorites, Profile)
- **WhatsAppButton**: Floating button with pulse animation

#### Property Components
- **PropertyCard**: Reusable card with image, price, badges, and actions
- **FeaturedProperties**: Carousel/grid for homepage
- **SearchFilter**: Advanced filtering component (deprecated, moved to ListingPage sidebar)

#### Sections
- **Hero**: Full-screen hero with animated headline and brush stroke effects
- **Benefits**: 6-column grid with icons and stats
- **HowItWorks**: 4-step process guide
- **Testimonials**: Customer reviews with 5-star ratings
- **CTASection**: Conversion-focused section with WhatsApp CTA
- **Footer**: Multi-column footer with links, contact, social media, and language switcher

### Mobile Optimizations
- Mobile-first responsive design
- Swipeable property gallery
- Bottom navigation (Home, Search, Favorites, Profile)
- Sticky WhatsApp button (adjusted for mobile nav)
- Mobile filter drawer for listings
- Touch-optimized cards and buttons
- Responsive grid layouts

## 🛠 Tech Stack

- **React 18.3.1** - UI framework
- **React Router 7.13.0** - Client-side routing (Data mode)
- **TypeScript** - Type safety
- **Tailwind CSS 4.1.12** - Utility-first styling
- **Motion (Framer Motion) 12.23.24** - Animations
- **Lucide React** - Icon library
- **Vite 6.3.5** - Build tool

## 📂 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx
│   │   ├── Benefits.tsx
│   │   ├── CTASection.tsx
│   │   ├── FeaturedProperties.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── MobileBottomNav.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── SearchFilter.tsx (deprecated)
│   │   ├── Testimonials.tsx
│   │   └── WhatsAppButton.tsx
│   ├── data/
│   │   └── properties.ts
│   ├── layouts/
│   │   └── RootLayout.tsx
│   ├── pages/
│   │   ├── FavoritesPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── ListingPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── PropertyDetailsPage.tsx
│   ├── App.tsx
│   └── routes.tsx
├── styles/
│   ├── fonts.css
│   └── theme.css
└── ...
```

## 🎯 Key Features

### Conversion Optimization
- Multiple WhatsApp CTAs throughout the site
- Sticky WhatsApp button on all pages
- "Disponível Agora" (Available Now) badges
- "Bills Inclusas" (Bills Included) highlights
- Immediate move-in filters
- Clear pricing with no hidden fees
- Brazilian-focused messaging and Portuguese language

### User Experience
- Smooth page transitions
- Animated hero section
- Image galleries with navigation
- Hover effects on cards
- Responsive design (mobile-first)
- Fast loading property cards
- Empty states with helpful CTAs
- 404 page with navigation options

### Mobile Features
- Bottom navigation bar
- Filter drawer (slide-in)
- Sticky CTAs
- Touch-optimized interactions
- Responsive image galleries
- Mobile-specific spacing adjustments

## 🚀 Development

### Install Dependencies
```bash
pnpm install
```

### Run Development Server
The Vite dev server is already running. View the preview in the Make interface.

### Build
```bash
pnpm run build
```

## ☁️ Admin online com Supabase

A página `/admin` agora pode publicar imóveis online usando Supabase.

### Configuração
Crie um arquivo `.env` com:

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_SUPABASE_PROPERTIES_TABLE=properties
```

### Comportamento
- A admin tenta carregar primeiro do Supabase
- Se não houver Supabase configurado, usa `localStorage`
- Se não houver dados locais, cai para `public/properties.json`
- Salvar, editar, deletar e importar JSON passam a sincronizar com o Supabase quando configurado

### Tabela esperada
A tabela `properties` deve ter ao menos:
- `id` inteiro
- `data` jsonb

## 📝 Content

### Property Data
All property data is stored in `src/app/data/properties.ts` with the following structure:

```typescript
interface Property {
  id: number;
  image: string;
  images: string[];
  type: string;
  title: string;
  region: string;
  price: number;
  description: string;
  longDescription: string;
  available: boolean;
  billsIncluded: boolean;
  bedrooms?: number;
  category: string;
  amenities: string[];
  deposit: number;
  nearbyStations: string[];
  coordinates: { lat: number; lng: number };
  furnishing: string;
  moveInDate: string;
}
```

### Sample Properties
The platform includes 9 sample properties across different regions and types:
- Studios in North and South London
- Ensuites in South and North London
- Flats (1-2 bedrooms) in East and West London
- Single and Double rooms in various locations

## 🌐 Routes

- `/` - Home page
- `/properties` - Property listing with filters
- `/property/:id` - Individual property details
- `/favorites` - Saved properties
- `/profile` - Customer area
- `*` - 404 Not Found page

## 🎨 Styling

### Custom CSS Variables
Defined in `src/styles/theme.css`:
- `--green-dark`, `--green-medium`, `--green-light`
- `--yellow`, `--yellow-dark`
- `--black`, `--gray-light`, `--gray-medium`

### Tailwind Configuration
Uses Tailwind CSS v4 with custom theme tokens integrated via CSS custom properties.

## 📞 Contact Integration

All WhatsApp CTAs point to: `https://wa.me/5588997993046` with pre-filled messages including property details.

## 🔄 Future Enhancements

- [ ] Implement actual favorites functionality with local storage
- [ ] Add user authentication and profile management
- [ ] Integrate Google Maps for location display
- [ ] Add image zoom/lightbox functionality
- [ ] Implement property comparison feature
- [ ] Add admin dashboard for property management
- [ ] Multi-language support (Portuguese/English toggle)
- [ ] Instagram feed integration
- [ ] Lead capture forms with email integration
- [ ] Virtual tour integration
- [ ] Advanced search with more filters
- [ ] Property availability calendar
- [ ] Review and rating system

---

Built with ❤️ for the Brazilian community in London
