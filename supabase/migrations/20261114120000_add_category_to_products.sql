alter table products
  add column category text not null default 'Otros';

update products set category = 'Ropa' where slug = 'camisetas-basicas-oversize-bhk';
update products set category = 'Calzado' where slug = 'zuecos-de-gamuza';
