-- Will delete all the data form all the tables
TRUNCATE TABLE
  order_items,
  ongoing_table_orders,
  orders,
  waiter,
  menu_item,
  menu_category,
  restaurant_address,
  restaurant,
  business,
  device
CASCADE;


-- Will delete all the tables and all the contents in them
DO
$do$
DECLARE
   r RECORD;
BEGIN
   FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
      EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
   END LOOP;
END
$do$;