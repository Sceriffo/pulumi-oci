#!/bin/bash

# Read the list of IPs from the file
IP_FILE="script/ip_list.txt"

# Check if the IP file exists
if [ ! -f "$IP_FILE" ]; then
  echo "IP list file '$IP_FILE' not found."
  exit 1
fi

# Read the IPs into an array
IFS=$'\n' read -r -d '' -a IP_ARRAY < "$IP_FILE"

# Prompt the user to select an IP
echo "Select an IP address to connect to:"

# Display a numbered list of IPs
for i in "${!IP_ARRAY[@]}"; do
  echo "[$((i+1))] ${IP_ARRAY[i]}"
done

# Prompt the user to enter a choice
read -p "Enter the number of the IP to connect to: " CHOICE

# Validate the user's choice
if ! [[ "$CHOICE" =~ ^[1-9][0-9]*$ ]] || ((CHOICE < 1 || CHOICE > ${#IP_ARRAY[@]})); then
  echo "Invalid choice. Please select a valid number."
  exit 1
fi

# Get the selected IP based on the user's choice
SELECTED_IP="${IP_ARRAY[CHOICE-1]}"

# Connect via SSH to the selected IP
echo "Connecting to $SELECTED_IP via SSH..."
ssh -i ~/.ssh/oci-key ubuntu@$SELECTED_IP