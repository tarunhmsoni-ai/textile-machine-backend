FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["MachineProjectAPI/MachineProjectAPI.csproj", "MachineProjectAPI/"]
RUN dotnet restore "MachineProjectAPI/MachineProjectAPI.csproj"

COPY ["MachineProjectAPI/", "MachineProjectAPI/"]
RUN dotnet build "MachineProjectAPI/MachineProjectAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MachineProjectAPI/MachineProjectAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "MachineProjectAPI.dll"]
