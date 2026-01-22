# 1. Chọn môi trường Node.js
FROM node:22-alpine as build-stage

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package.json vào trước
COPY package*.json ./

# 4. Cài đặt thư viện
RUN npm install

# 5. Copy toàn bộ code còn lại vào container
COPY . .

# 6. Mở cổng 8081
EXPOSE 8081

# 7. Lệnh chạy server
CMD ["npm", "start"]