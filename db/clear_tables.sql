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
