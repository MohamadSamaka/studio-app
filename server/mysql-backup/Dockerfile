FROM mysql:8.0

# Install cron and other necessary packages
RUN microdnf install -y cronie && \
    microdnf clean all

# Set working directory
WORKDIR /app

# Copy the backup script and cron configuration
COPY mysql_backup.sh /app/mysql_backup.sh
COPY backup-cron /etc/cron.d/backup-cron

# Make the backup script executable
RUN chmod +x /app/mysql_backup.sh

# Set permissions for cron file
RUN chmod 0644 /etc/cron.d/backup-cron && \
    chown root:root /etc/cron.d/backup-cron

# Create the log file for cron
RUN touch /var/log/cron.log

# Ensure the script and cron have correct ownership
RUN chown -R root:root /app/mysql_backup.sh

# Start cron in the foreground
CMD ["crond", "-n"]
