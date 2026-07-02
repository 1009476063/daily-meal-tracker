insert into meal_users (id, email, nickname)
values (
  '00000000-0000-0000-0000-000000000001',
  'demo@meal.test',
  'Demo'
)
on conflict (id) do nothing;
