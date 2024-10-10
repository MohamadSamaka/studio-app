# Exit immediately if a command exits with a non-zero status
set -e

# Function to display messages in color
echo_info() {
  echo "\033[1;34m$1\033[0m"
}

echo_info "Starting entrypoint.sh"

# Check if .env exists; if not, copy from .env.example
if [ ! -f .env ]; then
  echo_info ".env not found. Copying from .env.example."
  cp .env.example .env
fi

# Generate DATABASE_URL from other environment variables
export DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:3306/${DB_NAME}"

echo_info "DATABASE_URL set to: ${DATABASE_URL}"

# Function to check if MySQL is ready
wait_for_mysql() {
  echo_info "Waiting for MySQL at ${DB_HOST}:3306..."
  while ! nc -z "${DB_HOST}" 3306; do
    echo_info "MySQL is unavailable - sleeping"
    sleep 2
  done
  echo_info "MySQL is up - continuing"
}

# Call the function to wait for MySQL
wait_for_mysql

# Execute database initialization script
echo_info "Initializing the database..."
if ! npm run initiate-db-setup; then
  echo "\033[1;31mDatabase initialization failed. Exiting.\033[0m"
  exit 1
fi

# Execute the main command passed to the container
echo_info "Starting the Node.js application..."
exec "$@"
