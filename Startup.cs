using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Prostoi.Models;
using Prostoi.Models.Middlewares;
using Prostoi.Models.Repositories;

namespace Prostoi
{
  public class Startup
  {
    public IConfiguration Configuration { get; }
    public Startup(IConfiguration configuration) => Configuration = configuration;

    public void ConfigureServices(IServiceCollection services)
    {
      string oraString = Configuration.GetConnectionString("Bunker");
      string ccm5L2String = Configuration.GetConnectionString("CCM5L2");
      string ccm2L2String = Configuration.GetConnectionString("CCM2L2");
      string usageLogString = Configuration.GetConnectionString("SQLite");

      UsageLogRepository uRepo = new UsageLogRepository(usageLogString);

      services.AddScoped<IIdleRepository, IdleRepository>(provider => new IdleRepository(oraString, new BunkerAdapter()));
      services.AddScoped<ICCMRepository, CCMRepository>(provider => new CCMRepository(ccm5L2String, ccm2L2String));

      services.AddSingleton<IUsageLogRepository, UsageLogRepository>(provider => uRepo);
      services.AddSingleton<LoggingService>(provider => new LoggingService(uRepo));

      services.AddControllersWithViews();

      services.AddSpaStaticFiles(configuration =>
      {
        configuration.RootPath = "ClientApp/build";
      });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
      if (env.IsDevelopment())
        app.UseDeveloperExceptionPage();

      else
      {
        app.UseExceptionHandler("/Error");
        //app.UseHsts();
      }

      app.UseMiddleware<LoggingMiddleware>();

      //app.UseHttpsRedirection();
      app.UseStaticFiles();
      app.UseSpaStaticFiles();

      app.UseRouting();

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