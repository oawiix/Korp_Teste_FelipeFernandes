FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Directory.Packages.props", "./"]
COPY ["src/Estoque/Estoque.Api/Estoque.Api.csproj", "src/Estoque/Estoque.Api/"]
COPY ["src/Estoque/Estoque.Infrastructure/Estoque.Infrastructure.csproj", "src/Estoque/Estoque.Infrastructure/"]
COPY ["src/Estoque/Estoque.Application/Estoque.Application.csproj", "src/Estoque/Estoque.Application/"]
COPY ["src/Estoque/Estoque.Domain/Estoque.Domain.csproj", "src/Estoque/Estoque.Domain/"]
RUN dotnet restore "src/Estoque/Estoque.Api/Estoque.Api.csproj"
COPY . .
WORKDIR "/src/src/Estoque/Estoque.Api"
RUN dotnet build "./Estoque.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Estoque.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Estoque.Api.dll"]
