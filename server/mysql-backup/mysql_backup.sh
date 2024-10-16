#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Set variables
BACKUP_DIR=/backups
DATE=$(date +%Y-%m-%d)
BACKUP_FILE="${BACKUP_DIR}/db_backup_${DATE}.sql"
CONFIG_FILE="/tmp/.my.cnf"

# Create the backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Create a temporary .my.cnf file with credentials
cat <<EOF > "${CONFIG_FILE}"
[client]
user=${MYSQL_USER}
password=${MYSQL_PASSWORD}
host=${MYSQL_HOST}
EOF

# Secure the .my.cnf file
chmod 600 "${CONFIG_FILE}"

# Perform the database backup with --no-tablespaces option
mysqldump --defaults-extra-file="${CONFIG_FILE}" --no-tablespaces "${MYSQL_DATABASE}" > "${BACKUP_FILE}"

# Remove the temporary .my.cnf file
rm -f "${CONFIG_FILE}"

# Keep only the last 3 backups
cd "${BACKUP_DIR}"

# List backup files sorted by modification time (oldest first)
BACKUP_FILES=$(ls -1tr db_backup_*.sql)

# Count the number of backup files
FILE_COUNT=$(echo "${BACKUP_FILES}" | wc -l)

# Calculate the number of files to delete
NUM_TO_DELETE=$((FILE_COUNT - 3))

if [ "${NUM_TO_DELETE}" -gt 0 ]; then
  # Get the files to delete
  FILES_TO_DELETE=$(echo "${BACKUP_FILES}" | head -n "${NUM_TO_DELETE}")

  # Delete the old backup files
  for FILE in ${FILES_TO_DELETE}; do
    rm -f "${FILE}"
  done
fi

# Optional: Log the backup completion
echo "Backup for ${MYSQL_DATABASE} completed on ${DATE}" >> /var/log/cron.log
