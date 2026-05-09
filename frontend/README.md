# Docker Setup Commonds

cd backend
docker start zonnecto-postgres
docker start zonnecto-redis
docker run -d --name zonnecto-postgres -p 5432:5432 -e POSTGRES_DB=zonnecto -e POSTGRES_PASSWORD=postgres postgres:15
docker run -d --name zonnecto-redis -p 6379:6379 redis:7
docker ps
docker exec -it zonnecto-redis redis-cli
ping
exit

# Backend Setup Commonds

cd backend
rm -r -fo target
mvn spring-boot:run "-Dspring-boot.run.jvmArguments=-Duser.timezone=Asia/Kolkata"
mvn clean install

# Frontend Setup Commonds

cd frontend
npm run dev
npm install

# GitHub Push Commonds

git status
git init
git add .
git commit -m "SEO Optimized"
git pull origin main
git push origin main
