Symfony: Twig UI, REST API /api/v1, EasyAdmin. SQLite (.env DATABASE_URL).

  composer install
  php bin/console doctrine:migrations:migrate --no-interaction
  php bin/console doctrine:fixtures:load --no-interaction
  composer run serve
  → http://127.0.0.1:8000

First registered user gets ROLE_ADMIN. Routes: config/packages/security.yaml.

React app (optional): ../../React/forgeheros — npm run dev there (needs this server).

Need: PHP 8.4+, Composer, SQLite PDO. ext-fileinfo recommended for avatars.
