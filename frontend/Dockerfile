# Use official Node.js image as base
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies 
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app
# RUN npm install react-markdown
# RUN npm install react-syntax-highlighter
# RUN npm install remark-gfm
# RUN npm install react-bootstrap
# RUN npm install react-icons
# RUN npm install @fortawesome/react-fontawesome \
#     @fortawesome/free-solid-svg-icons \
#     @fortawesome/fontawesome-svg-core \
#     @fortawesome/free-regular-svg-icons \
#     @fortawesome/free-brands-svg-icons \
#     @fortawesome/pro-thin-svg-icons
RUN npm install react-markdown react-syntax-highlighter remark-gfm react-bootstrap react-icons \
    @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons \
    @fortawesome/fontawesome-svg-core @fortawesome/free-regular-svg-icons \
    @fortawesome/free-brands-svg-icons
    
RUN npm run build

# Expose port 3000 for the React app
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
