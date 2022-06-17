using System.Collections.Generic;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Prostoi.Models.Middlewares;
using Prostoi.Models.Repositories;
using Prostoi.Models.Repositories.Interfaces;

namespace Prostoi
{
  public class Startup
  {
    public IConfiguration Configuration { get; }
    public Startup(IConfiguration configuration) => Configuration = configuration;

    public void ConfigureServices(IServiceCollection services)
    {
      string bunkerString = Configuration.GetConnectionString("Bunker");

      IDictionary<int, string> ccmStrings = new Dictionary<int, string>() {
        {2,Configuration.GetConnectionString("CCM2L2")},
        {5,Configuration.GetConnectionString("CCM5L2")},
      };

      string usageLogString = Configuration.GetConnectionString("SQLite");

      services.AddSingleton<IIdleRepository>(RepositoryFactory.CreateIdleRepo(bunkerString));
      services.AddSingleton<ICCMRepository>(RepositoryFactory.CreateCcmRepo(ccmStrings));
      services.AddSingleton<IUsageLogRepository>(RepositoryFactory.CreateUsageRepo(usageLogString));

      services.AddSingleton<LoggingService>();

      services.AddControllersWithViews();
      services.AddSpaStaticFiles(configuration =>
      {
        configuration.RootPath = "ClientApp/build";
      });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
      if (env.IsDevelopment()) app.UseDeveloperExceptionPage();
      else app.UseExceptionHandler("/Error");

      app.UseStaticFiles();
      app.UseSpaStaticFiles();

      app.UseRouting();

      app.UseMiddleware<LoggingMiddleware>();

      app.UseEndpoints(endpoints =>
      {
        endpoints.MapControllerRoute(
          name: "default",
          pattern: "{controller}/{action=Index}/{id?}");
      });

      app.UseSpa(spa =>
      {
        spa.Options.SourcePath = "ClientApp";

        if (env.IsDevelopment())
          spa.UseReactDevelopmentServer(npmScript: "start");
      });
    }
  }
}