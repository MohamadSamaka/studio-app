#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Function to check if a file exists
file_exists() {
    [ -f "$1" ]
}

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until mysqladmin ping -h"$DB_HOST" --silent; do
    echo "Waiting for MySQL..."
    sleep 2
done

echo "MySQL is up and running."

# Check if DB_BACKUP_FILE is set
if [ -n "$DB_BACKUP_FILE" ]; then
    BACKUP_PATH="/backups/$DB_BACKUP_FILE"
    echo "DB_BACKUP_FILE is set to '$DB_BACKUP_FILE'. Checking for backup file..."

    if file_exists "$BACKUP_PATH"; then
        echo "Backup file found at '$BACKUP_PATH'. Restoring database..."
        
        # Restore the database
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$BACKUP_PATH"
        
        echo "Database restored successfully from '$BACKUP_PATH'."
    else
        echo "Backup file '$BACKUP_PATH' not found. Proceeding with standard database seeding."
        
        # Run the standard database setup
        npm run initiate-db-setup
    fi
else
    echo "DB_BACKUP_FILE is not set. Proceeding with standard database seeding."
    
    # Run the standard database setup
    npm run initiate-db-setup
fi

# Execute the main container command
exec "$@"
