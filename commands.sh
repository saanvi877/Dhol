# Temporarily increase the limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Or for permanent change, create/edit this file
sudo nano /etc/sysctl.d/10-fs.conf

# Add this line
fs.inotify.max_user_watches=524288

# Then apply changes
sudo sysctl --system 