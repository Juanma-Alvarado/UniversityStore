-- Emprendimientos: quién hace cada producto ("detrás del emprendimiento").
-- Base para la Fase 3: más adelante cada emprendimiento tendrá dueño y dashboard.

create table ventures (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text not null,
  -- Párrafos separados por una línea en blanco.
  story text not null,
  image_url text,
  -- Autor de la foto y link a su perfil (obligatorio si la foto es de Unsplash).
  image_credit text,
  image_credit_url text,
  -- Usuario de Instagram sin @.
  instagram text,
  created_at timestamptz not null default now()
);

alter table ventures enable row level security;

create policy "Ventures are publicly readable"
  on ventures for select
  to anon, authenticated
  using (true);

alter table products
  add column venture_id uuid references ventures (id) on delete set null;

create index products_venture_id_idx on products (venture_id);

-- ---------------------------------------------------------------------------
-- CONTENIDO DE EJEMPLO: textos inventados y fotos de Unsplash. Reemplázalos
-- por los reales (Table Editor → ventures) antes de publicar la tienda.
-- ---------------------------------------------------------------------------

insert into ventures (slug, name, tagline, story, image_url, image_credit, image_credit_url, instagram)
values
  (
    'bhk',
    'BHK',
    'Básicos oversize estampados a mano, en tandas pequeñas.',
    E'Esta historia es un texto de ejemplo: cámbiala por la real en Supabase (tabla ventures).\n\nBHK empezó en un cuarto de residencia, con una mesa de serigrafía armada con lo que había a mano y la idea de hacer la camiseta básica que nadie encontraba: tela gruesa, corte amplio y que aguante cien lavadas.\n\nCada tanda se hace por pedido. Así no sobra inventario, cada camiseta sale recién estampada y lo que se gana vuelve a la siguiente tanda.',
    'https://images.unsplash.com/photo-1773525912431-ee1eff5e1ab9?ixid=M3wxMDE3MjIwfDB8MXxzZWFyY2h8Mnx8c2NyZWVuJTIwcHJpbnRpbmclMjB0LXNoaXJ0c3xlbnwwfDB8fHwxNzk1NDQyMzE1fDI&ixlib=rb-4.1.0&fm=jpg&fit=max&w=1600&q=80',
    'Anthony Roberts',
    'https://unsplash.com/@arcreates',
    null
  ),
  (
    'paso-lento',
    'Paso Lento',
    'Zuecos de gamuza cosidos a mano en un taller del barrio.',
    E'Esta historia es un texto de ejemplo: cámbiala por la real en Supabase (tabla ventures).\n\nPaso Lento nació entre clases de diseño industrial y las tardes en el taller de calzado de la familia. La idea era simple: un zueco cómodo para todo el día en el campus, hecho con gamuza de curtiembres colombianas.\n\nCada par se corta y se cose a mano, y por eso se hace por pedido: tarda unos días más, pero dura años.',
    'https://images.unsplash.com/photo-1644258676710-ffb99d7d7a1b?ixid=M3wxMDE3MjIwfDB8MXxzZWFyY2h8MXx8c2hvZW1ha2VyJTIwd29ya3Nob3AlMjBsZWF0aGVyfGVufDB8MHx8fDE3OTU0NDIzMTV8Mg&ixlib=rb-4.1.0&fm=jpg&fit=max&w=1600&q=80',
    'Alexander Kirov',
    'https://unsplash.com/@alexanderdaniel',
    null
  );

update products
  set venture_id = (select id from ventures where slug = 'bhk')
  where slug = 'camisetas-basicas-oversize-bhk';

update products
  set venture_id = (select id from ventures where slug = 'paso-lento')
  where slug = 'zuecos-de-gamuza';
