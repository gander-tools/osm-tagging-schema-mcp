# OSS-Fuzz build Dockerfile
# This is prepared for potential future OSS-Fuzz submission
# Currently using property-based testing with fast-check

FROM gcr.io/oss-fuzz-base/base-builder-javascript@sha256:3bee9a9f8fffb5f7a509cf9548b137daf58cfb84cea6b962715b058e206d98d3

# Install Node.js (latest LTS)
RUN apt-get update && \
    apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /usr/share/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
        -o /usr/share/keyrings/nodesource.asc && \
    echo "deb [signed-by=/usr/share/keyrings/nodesource.asc] https://deb.nodesource.com/node_24.x nodistro main" \
        > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs

# Copy project files
COPY . $SRC/osm-tagging-schema-mcp
WORKDIR $SRC/osm-tagging-schema-mcp

# Install dependencies
RUN npm ci

# Build the project
RUN npm run build
