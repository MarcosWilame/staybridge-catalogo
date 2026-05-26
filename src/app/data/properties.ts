export interface Property {
  id: number;
  image: string;
  images: string[];
  video?: string;
  type: string;
  title: string;
  region: string;
  localArea?: string;
  price: string;
  description: string;
  longDescription: string;
  available: boolean;
  billsIncluded: boolean;
  bedrooms?: number;
  bathrooms?: number;
  category: string;
  amenities: string[];
  deposit: number;
  nearbyStations: string[];
  coordinates: { lat: number; lng: number };
  furnishing: string;
  moveInDate: string;
  postcode: string;
  address: string;
  people: number;
}

const studioImage =
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200';

const ensuiteImage =
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200';

const singleImage =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200';

const doubleImage =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200';

export const properties: Property[] = [
  {
  id: 20,
  image: 'https://lh3.googleusercontent.com/d/1aTCb5tpqflds8l-C8eXjYJkGFShdJXA3',

  images: [
    'https://lh3.googleusercontent.com/d/1aTCb5tpqflds8l-C8eXjYJkGFShdJXA3',

    'https://lh3.googleusercontent.com/d/1mnNNT_9hCOnCfgXGIm0yK7-Fy_E37ElE',

    'https://lh3.googleusercontent.com/d/1_gnujao8l9FTcEKpRL4OvKvvxdaLuXy4',

    'https://lh3.googleusercontent.com/d/14D2obX3eWbKFROwEhoqBDozYHBnue5Pc',
  ],

  video:
  'https://drive.google.com/uc?export=download&id=1j7bAJIcDndZ3ddG2ImB9_6bPBLvnCxIX',

  type: 'Studio',
  title: 'Studio 8 - NW10 2EL',
  region: 'North London',
  price: '£350/week',

  description:
    'Studio moderno em Dollis Hill.',

  longDescription:
    'Studio moderno totalmente mobiliado com bills inclusas.',

  available: true,
  billsIncluded: true,
  bedrooms: 1,

  category: 'studio',

  amenities: [
    'Bills inclusas',
    'Wi-Fi',
    'Mobiliado',
  ],

  deposit: 700,

  nearbyStations: [
    'Dollis Hill',
  ],

  coordinates: {
    lat: 51.551,
    lng: -0.239,
  },

  furnishing: 'Mobiliado',

  moveInDate: 'Imediata',

  postcode: 'NW10 2EL',

  address:
    '1 Meyrick Road NW10 2EL',

  people: 2,
},

  {
  id: 32,
  image: 'https://drive.google.com/thumbnail?id=1kqs9FomsylDymaFtxAFgpiY-5MyJ7pUg&sz=w2000',
  images: [
  'https://drive.google.com/thumbnail?id=1kqs9FomsylDymaFtxAFgpiY-5MyJ7pUg&sz=w2000',
  'https://drive.google.com/thumbnail?id=1uVYdaiak0qWZuXSERK3To5-NgcHPub9T&sz=w2000',
  'https://drive.google.com/thumbnail?id=165GheMsj_QQoDrTsCcXJi3EKnp9nrcHc&sz=w2000',
  'https://drive.google.com/thumbnail?id=1cld4AyM4qvkuVNiuY9jli0fysar7dadv&sz=w2000',
  'https://drive.google.com/thumbnail?id=1j7bAJIcDndZ3ddG2ImB9_6bPBLvnCxIX&sz=w2000',
          ],

  type: 'Studio',
  title: 'Studio 4 - SW16 5BA',
  region: 'South London',
  price: '£280/week',
  description: 'Studio moderno em Streatham.',
  longDescription:
    'Studio moderno totalmente mobiliado com bills inclusas.',
  available: true,
  billsIncluded: true,
  bedrooms: 1,
  category: 'studio',
  amenities: [
    'Bills inclusas',
    'Wi-Fi',
    'Mobiliado',
  ],
  deposit: 560,
  nearbyStations: ['Streatham'],
  coordinates: {
    lat: 51.42,
    lng: -0.13,
  },
  furnishing: 'Mobiliado',
  moveInDate: 'Imediata',
  postcode: 'SW16 5BA',
  address: '2 Bencroft Road SW16 5BA',
  people: 2,
},
  
{
  id: 34,

  image: 'https://drive.google.com/thumbnail?id=18D4FAjFTwvbRwZVtVhhtd_E_DOi8_Cxv&sz=w2000',

  images: [
  'https://drive.google.com/thumbnail?id=18D4FAjFTwvbRwZVtVhhtd_E_DOi8_Cxv&sz=w2000',

  'https://drive.google.com/thumbnail?id=1nyyScPrw9zj3nOmBNgTkCPwhisbOS1Bg&sz=w2000',

  'https://drive.google.com/thumbnail?id=1a5SnD5FA-No8VI-RN1bfw_7JCppHKybU&sz=w2000',

  'https://drive.google.com/thumbnail?id=1kjXlpjozHj3zL6a3pry0vtN8pY6V8fpB&sz=w2000',
          ],

  type: 'Single Room',

  title: 'Single Room 8 - NW2 7DL',

  region: 'North London',

  price: '£160/week',

  description:
    'Quarto individual confortável em Neasden.',

  longDescription:
    'Single room totalmente mobiliado em ótima localização de Neasden. Ambiente confortável, com fácil acesso ao transporte público e bills inclusas.',

  available: true,

  billsIncluded: true,

  bedrooms: 1,

  category: 'single',

  amenities: [
    'Bills inclusas',
    'Wi-Fi',
    'Mobiliado',
    'Cozinha equipada',
  ],

  deposit: 320,

  nearbyStations: [
    'Neasden Station',
  ],

  coordinates: {
    lat: 51.553,
    lng: -0.252,
  },

  furnishing: 'Mobiliado',

  moveInDate: 'Now',

  postcode: 'NW2 7DL',

  address:
    '10 Paddock Road NW2 7DL',

  people: 1,
},

  {
  id: 35,
  image: 'https://drive.google.com/thumbnail?id=1r20rODzN_tUaA92nQFR0_QojXVlagMse&sz=w2000',

  images: [
  'https://drive.google.com/thumbnail?id=1r20rODzN_tUaA92nQFR0_QojXVlagMse&sz=w2000',

  'https://drive.google.com/thumbnail?id=1nbbBCCTWQjQ14jQCbYQbFUhQbor7XDO7&sz=w2000',

  'https://drive.google.com/thumbnail?id=11MKbUYO32khaVmQ_jJN1uI9HUgEIH-nW&sz=w2000',

  'https://drive.google.com/thumbnail?id=1FJrmQOgLcSeHzXlaETDNJZ9Mbn01d74T&sz=w2000',

  'https://drive.google.com/thumbnail?id=1msrNWE83cx9TL-Jq3fJxLB-EqU82S51m&sz=w2000',
  ],

  type: 'Ensuite',
  title: 'Ensuite 4 - SW16 5BJ',
  region: 'South London',
  price: '£270/week',

  description:
    'Ensuite moderna em Streatham.',

  longDescription:
    'Ensuite moderna totalmente mobiliada em Streatham, com excelente localização, banheiro privativo, ambiente confortável e bills inclusas.',

  available: true,
  billsIncluded: true,

  bedrooms: 1,

  category: 'ensuite',

  amenities: [
    'Bills inclusas',
    'Wi-Fi',
    'Banheiro Privativo',
    'Mobiliado',
    'Cozinha equipada',
  ],

  deposit: 540,

  nearbyStations: [
    'Streatham',
  ],

  coordinates: {
    lat: 51.427,
    lng: -0.130,
  },

  furnishing: 'Mobiliado',

  moveInDate: 'Imediata',

  postcode: 'SW16 5BJ',

  address: '10 Larbert Road SW16 5BJ',

  people: 1,
},

  {
  id: 36,

  image: 'https://drive.google.com/thumbnail?id=1kBb1qCrgElDcgkZG0Ve6d09L1_V24mD1&sz=w2000',

images: [
  'https://drive.google.com/thumbnail?id=1kBb1qCrgElDcgkZG0Ve6d09L1_V24mD1&sz=w2000',

  'https://drive.google.com/thumbnail?id=1XR3S4ZlMGt6ZmaIlz2lMyjgYkBHe_H8o&sz=w2000',

  'https://drive.google.com/thumbnail?id=1hrjHmHbuKcePeALbhL4Ii_i2LblHM1Ru&sz=w2000',

  'https://drive.google.com/thumbnail?id=1T-jwLW3bMd3eOKsAgBimSXiGVfpzApvZ&sz=w2000',

  'https://drive.google.com/thumbnail?id=1ledfwpl4-eHUbCP138VI2zNujyj18ZQR&sz=w2000',

  'https://drive.google.com/thumbnail?id=1dX5vp0xCNWCkEgwf-0C-EdfiRkAmpKVo&sz=w2000',

  'https://drive.google.com/thumbnail?id=1Cl3rPiEbHFnjHWev8DIvKhd_R8kThUsh&sz=w2000',

  'https://drive.google.com/thumbnail?id=1ncBPzvrqpEvGh3yMxbI6zihbwDHguJxb&sz=w2000',

  'https://drive.google.com/thumbnail?id=1txw028rvErFN7CAGfeZitRm-4Rf-mo1r&sz=w2000',

  'https://drive.google.com/thumbnail?id=1ww7R-iJuA95j5a94VNzmbhQXPAFt0yJm&sz=w2000',
],

  type: '2 Bedroom Flat',

  title: '2 Bedroom Flat 4 - SE25 6NN',

  region: 'South London',

  price: '£650/week',

  description:
    'Flat completo com 2 quartos em Croydon.',

  longDescription:
    'Flat completo totalmente mobiliado em Croydon com 2 quartos, 1 banheiro, sala ampla e cozinha completa equipada. Ideal para famílias ou amigos compartilhando acomodação, em excelente localização e com bills inclusas.',

  available: true,

  billsIncluded: true,

  bedrooms: 2,

  bathrooms: 1,

  category: 'flat',

  amenities: [
    'Bills inclusas',
    'Wi-Fi',
    '2 quartos',
    '1 banheiro',
    'Sala ampla',
    'Cozinha completa',
    'Mobiliado',
  ],

  deposit: 1300,

  nearbyStations: [
    'Norwood Junction',
    'Selhurst',
  ],

  coordinates: {
    lat: 51.398,
    lng: -0.074,
  },

  furnishing: 'Mobiliado',

  moveInDate: 'Imediata',

  postcode: 'SE25 6NN',

  address: '4 Prince Road SE25 6NN',

  people: 4,
}, 

  {
  id: 37,
  image: 'https://drive.google.com/thumbnail?id=1gDaxHhvAD_P3aMGO72fcGOYLSc4W4_qJ&sz=w2000',

  images: [
    'https://drive.google.com/thumbnail?id=1gDaxHhvAD_P3aMGO72fcGOYLSc4W4_qJ&sz=w2000',
    'https://drive.google.com/thumbnail?id=1dhpvzgSutuiE_ZkT3K8XysrOkDgsNSXM&sz=w2000',
    'https://drive.google.com/thumbnail?id=16ANDcPBOaBOK_fB0CMAahCOEZl8FYvkj&sz=w2000',
    'https://drive.google.com/thumbnail?id=1h-00UwyuJXnvCvZow2w4yHKPaxu393da&sz=w2000',
    'https://drive.google.com/thumbnail?id=1-1zIwSGKreQvuOVp_O8mpT21IczQZaSA&sz=w2000',
    'https://drive.google.com/thumbnail?id=1yqFFhdvRjKlqpDDc-_MzfLmso_KBnWRA&sz=w2000',
  ],

  type: '2 bedroom flat',
  title: '2 Bedroom Flat - Harrow',
  region: 'Harrow',
  price: '£650/week',

  description: 'Flat com 2 quartos, sala, cozinha e 1 banheiro.',
  longDescription:
    'Imóvel composto por 2 quartos, sala de estar, cozinha equipada e 1 banheiro. Excelente localização em Harrow com boa conectividade e estrutura residencial confortável.',

  available: true,
  billsIncluded: false,

  bedrooms: 2,
  category: 'flat',

  amenities: [],
  deposit: 0,

  nearbyStations: [],
  coordinates: {
    lat: 0,
    lng: 0,
  },

  furnishing: 'Mobiliado',
  moveInDate: '30/05/2026',
  postcode: 'HA2 7ES',
  address: '10 Kingston House, 232-238 Imperial Drive',
  people: 5,
}

];
