#!/bin/bash

# Function to get auth token
get_auth_token() {
    token_response=$(curl -s http://localhost:3000/auth/token)
    token=$(echo $token_response | jq -r '.token')
    if [ -n "$token" ]; then
        echo "$token"
    else
        echo "Failed to get auth token"
        exit 1
    fi
}

# Function to send sanitize request and save response
send_sanitize_request() {
    local token=$1
    local prompt=$2
    local timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    
    response=$(curl -s -X POST \
        http://localhost:3000/sanitize \
        -H "Authorization: Bearer $token" \
        -H 'Content-Type: application/json' \
        -d "{\"prompt\": \"$prompt\"}")
    
    echo "{\"timestamp\": \"$timestamp\", \"prompt\": \"$prompt\", \"response\": $response}" | jq '.' >> responses.json
    echo "Request completed for prompt: ${prompt:0:50}..."
}

# Function to generate random email
generate_random_email() {
    local names=("john" "alice" "bob" "sarah" "mike" "emma" "david" "lisa" "peter" "anna")
    local surnames=("doe" "smith" "jones" "wilson" "brown" "davis" "miller" "taylor" "anderson" "thomas")
    local domains=("example.com" "company.com" "test.org" "domain.com" "email.com" "service.net" "corp.org")
    
    local random_name=${names[$RANDOM % ${#names[@]}]}
    local random_surname=${surnames[$RANDOM % ${#surnames[@]}]}
    local random_domain=${domains[$RANDOM % ${#domains[@]}]}
    
    echo "${random_name}.${random_surname}@${random_domain}"
}

# Function to generate random prompt
generate_random_prompt() {
    local email=$(generate_random_email)
    local prefixes=("This is a test prompt from" "Hello from" "Send me sample emails from" "Looking for email samples from" "Test request from" "Data request from")
    local prefix=${prefixes[$RANDOM % ${#prefixes[@]}]}
    
    echo "$prefix $email"
}

# Get number of prompts from command line or use default
NUM_PROMPTS=${1:-6}
MAX_PARALLEL=${2:-10}

# Generate prompts array
declare -a prompts
for ((i=0; i<NUM_PROMPTS; i++)); do
    prompts+=("$(generate_random_prompt)")
done

# Initialize responses.json with an empty array
echo "[]" > responses.json

# Get auth token
echo "Getting auth token..."
AUTH_TOKEN=$(get_auth_token)

if [ -z "$AUTH_TOKEN" ]; then
    echo "No auth token available"
    exit 1
fi

# Process counter
count=0

# Process all prompts
echo "Processing $NUM_PROMPTS prompts with max $MAX_PARALLEL parallel processes..."
for prompt in "${prompts[@]}"; do
    # Start request in background
    send_sanitize_request "$AUTH_TOKEN" "$prompt" &
    
    # Increment counter
    ((count++))
    
    # If we've reached MAX_PARALLEL, wait for a process to finish
    if ((count >= MAX_PARALLEL)); then
	wait
	count=0
    fi
    
    # Small delay to prevent overwhelming the server
    sleep 0.1
done

# Wait for remaining processes to finish
wait

echo "All requests completed. Check responses.json for results."
