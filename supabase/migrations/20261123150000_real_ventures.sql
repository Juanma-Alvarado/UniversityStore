-- Emprendimientos reales de la universidad (tomados de sus publicaciones) en
-- lugar de los de ejemplo, y contacto por WhatsApp mientras los pagos en línea
-- están en pausa.

-- Número con indicativo y solo dígitos, p. ej. 573001234567. Vacío = sin botón.
-- Cargarlo solo cuando el emprendedor confirme que quiere aparecer.
alter table ventures add column whatsapp text
  check (whatsapp is null or whatsapp ~ '^[0-9]{10,15}$');

-- Fuera los emprendimientos de ejemplo. Las camisetas y los zuecos son productos
-- propios (todavía sin tienda): se quedan, solo pierden el venture_id (on delete
-- set null).
delete from ventures where slug in ('bhk', 'paso-lento');

-- Nombres provisionales: corregirlos en Table Editor → ventures si no son.
insert into ventures (slug, name, tagline, story, image_url)
values
  (
    'prensaditos',
    'Prensaditos',
    'Prensaditos calientes a $5.000. Te lo llevamos a donde estés.',
    E'Pan prensado y bien relleno, por solo $5.000.\n\nTe lo llevamos a donde estés.',
    '/products/prensaditos.jpg'
  ),
  (
    'flovera',
    'Flovera',
    'Flores de felpilla y detalles personalizados que perduran.',
    E'Ramos, cuadros con flores personalizados, arbolitos de Navidad, diademas y coronas navideñas, espejos, lámparas y macetas de diferentes temáticas: One Piece, Spider-Man, Batman, Hello Kitty, Snoopy, Rosita Fresita, Demon Slayer, todas las princesas de Disney y muchos más.\n\nPuedes personalizarlo a tu gusto, también para regalar en las graduaciones que se aproximan. Obsequia un detalle que perdurará.',
    '/products/flovera-ramo.jpg'
  ),
  (
    'stud',
    'STUD',
    'Camisetas con estampados grandes, brillantes y súper llamativos.',
    E'Camisetas con estampados grandes, brillantes y súper llamativos, en diferentes diseños y colores para elegir.\n\nSepara la tuya con $50.000 y paga los $35.000 restantes al momento de la entrega.',
    '/products/stud-camisetas.jpg'
  );

-- Flovera todavía no tiene producto cargado: falta el precio de sus ramos.
insert into products (slug, name, description, price, currency, image_url, stock, made_to_order, category, venture_id)
values
  (
    'prensadito',
    'Prensadito',
    'Pan prensado y bien relleno. Te lo llevamos a donde estés.',
    5000,
    'COP',
    '/products/prensaditos.jpg',
    0,
    true,
    'Comida',
    (select id from ventures where slug = 'prensaditos')
  ),
  (
    'camiseta-estampada-stud',
    'Camiseta estampada STUD',
    'Estampados grandes, brillantes y súper llamativos, en diferentes diseños y colores. Sepárala con $50.000 y paga los $35.000 restantes al momento de la entrega.',
    85000,
    'COP',
    '/products/stud-camisetas.jpg',
    0,
    true,
    'Ropa',
    (select id from ventures where slug = 'stud')
  );
