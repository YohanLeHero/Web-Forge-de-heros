Symfony backend + React (Vite) frontend.

  1) cd Symfony/Forge-des-heros
     composer install
     php bin/console doctrine:migrations:migrate --no-interaction
     php bin/console doctrine:fixtures:load
     yes to purge the base
     composer run serve
     → http://127.0.0.1:8000

  2) cd React/forgeheros
     npm install
     npm run dev

Need: PHP 8.4+, Composer, Node.js + npm.
