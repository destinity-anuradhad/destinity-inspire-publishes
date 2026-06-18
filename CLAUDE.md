# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a **publish artifacts repository**, not a source code repository. It stores pre-built IIS deployment outputs from separate source repos (Visual Studio publish / `dotnet publish`). The primary role of this repo is to version-control deployment artifacts and track IIS configuration for the Destinity Inspire hotel management system.

## Modules and Versions

Two modules, each with two parallel versions that share the same port — **only one version may be active on IIS at a time**:

| Module | v2 Stack | v3 Stack |
|--------|----------|----------|
| **Central Access** (admin/api/login) | ASP.NET Framework 4.6, .NET CLR v4.0 | ASP.NET Core (.NET 8+), AspNetCoreModuleV2 |
| **Front Office** (app/ext-api) | ASP.NET Framework 4.8, .NET CLR v4.0 | ASP.NET Core (.NET 8+), AspNetCoreModuleV2 |

## Port Assignments

| Service | Port |
|---------|------|
| central-login | 8090 |
| central-api | 8091 |
| central-admin | 8092 |
| fo-app | 8040 |
| fo-ext-api | 8050 |

## IIS Deployment

All sites deploy to `C:\inetpub\` and back up to `C:\inetpub\backups\<site-name>` before publishing. Standard deployment sequence: stop site → backup → copy artifacts → start site.

**v2 sites** require IIS features: `Web-Net-Fx45-ASPNET`, `Web-Management-Console`  
**v3 sites** require IIS features: `AspNetCoreModuleV2`, `Web-Management-Console`

Full per-site deployment config (bindings, app pool, prerequisites, paths) is in `README.md`.

### Useful IIS commands (run as Administrator)

```powershell
# Stop/start a site
Stop-WebSite -Name "fo_v2_app"
Start-WebSite -Name "fo_v2_app"

# Check site status
Get-WebSite | Select-Object Name, State, PhysicalPath

# Recycle application pool
Restart-WebAppPool -Name "fo_v2_app"
```

## Databases

SQL Server 2019, compatibility level **130** (SQL Server 2016 mode).

| Database | Used by |
|----------|---------|
| `CentralAccessDB` | All Central services |
| `HotelResWeb` (or client-specific variant e.g. `HotelResWeb_Browns`) | FO app, FO ext-api |
| `HotelResWeb_AuditTail` | All services |
| `Categlog_vrV2` | FO inventory |
| `HotelResWeb_PassportScan` | FO passport scanning |

Database backup files (`.bak`) are tracked via **Git LFS** — see `.gitattributes`. They live under `central/v3/central_v3_api/`.

## Key Configuration Files

- `fo/v2/fo_v2_app/Web.config` — FO v2 connection strings and 80+ app settings (email, payment gateway, external APIs, SSRS report server, SaaS tenant config)
- `central/v3/central_v3_login/appsettings.json` — Central v3 login settings including Azure AD (disabled by default: `IsAzureEntraIDEnable: "0"`)
- `central/v3/central_v3_login/web.config` — ASP.NET Core in-process hosting config
- `README.md` — Complete IIS deployment JSON for all 10 sites

## Architecture Notes

- **Central Access** handles authentication/authorization across the system; FO is the primary hotel operations frontend.
- **FO v2** is a full ASP.NET MVC 5 application with Areas for each functional domain: Reservation, Housekeeping, CashieringAndPosting, Reporting, DataAnalysis, GuestPortal, SpaReservation, MealReservation, Maintenance, Auditing, UserAccess, Administration.
- **Central v3** supports multi-language localization (12 languages including zh-Hans, zh-Hant, ja, ko, pt-BR).
- **SaaS mode** in FO v2 is controlled via `Web.config` app settings — connection strings and behavior vary per tenant.
- When updating `Web.config` or `appsettings.json`, these are production configs that will be deployed directly — treat credential fields with care.
