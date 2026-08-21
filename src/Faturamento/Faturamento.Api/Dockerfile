FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Directory.Packages.props", "./"]
COPY ["src/Faturamento/Faturamento.Api/Faturamento.Api.csproj", "src/Faturamento/Faturamento.Api/"]
COPY ["src/Faturamento/Faturamento.Application/Faturamento.Application.csproj", "src/Faturamento/Faturamento.Application/"]
COPY ["src/Faturamento/Faturamento.Domain/Faturamento.Domain.csproj", "src/Faturamento/Faturamento.Domain/"]
COPY ["src/Faturamento/Faturamento.Infrastructure/Faturamento.Infrastructure.csproj", "src/Faturamento/Faturamento.Infrastructure/"]
RUN dotnet restore "src/Faturamento/Faturamento.Api/Faturamento.Api.csproj"
COPY . .
WORKDIR "/src/src/Faturamento/Faturamento.Api"
RUN dotnet build "./Faturamento.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Faturamento.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Faturamento.Api.dll"]
