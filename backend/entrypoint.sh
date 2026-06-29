#!/bin/bash

# Run migrations and seeders automatically on startup
php artisan migrate --force --seed

# Start Apache web server in the foreground
exec apache2-foreground
