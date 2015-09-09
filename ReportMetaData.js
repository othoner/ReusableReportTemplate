class ReportMetaData
{
  static var DashboardQuestions = {};
  static var FilterQuestions = {};
  static var DemographicQuestions = {};
  static var MetricQuestions = {};
  
  static function GetDashboardQuestions(report, datasourceId, log)
  {
    var project : Project = report.DataSource.GetProject(datasourceId);
    var cacheKey = [datasourceId, project.ProjectId, report.CurrentLanguage].join('_');
    if(DashboardQuestions[cacheKey] == null)// || (Config.MetaDataCacheMinutes != null && (DashboardQuestions[cacheKey].Timestamp - DateTime.Now).TotalMinutes < Config.MetaDataCacheMinutes))
    {
      var start = DateTime.Now;
      var dashboardQuestions = project.GetQuestionsWithAnswers(false, ["dashboard"]);
      //var dashboardQuestions = project.GetQuestionsByCategory("dashboard");
      var end = DateTime.Now;
      if(log)
      {  
        log.LogDebug("GetDashboardQuestions => GetQuestionsByCategory: " + (end-start).TotalMilliseconds);
        log.LogDebug("GetDashboardQuestions => GetQuestionsByCategory: " + (start-end).TotalMilliseconds);
      }
      DashboardQuestions[cacheKey] = {Questions: MetaData.CreateLocalQuestionList(dashboardQuestions, true), Timestamp: DateTime.Now};
      return DashboardQuestions[cacheKey].Questions;
    }
    else
    {
      return DashboardQuestions[cacheKey].Questions;
    }
  }
  
  static function GetFilterQuestions(report, datasourceId, log)
  {
    var project : Project = report.DataSource.GetProject(datasourceId);
    var cacheKey = [datasourceId, project.ProjectId, report.CurrentLanguage].join('_');
    if(FilterQuestions[cacheKey] == null)// || (Config.MetaDataCacheMinutes != null && (FilterQuestions[cacheKey].Timestamp - DateTime.Now).TotalMinutes < Config.MetaDataCacheMinutes))
    {
      var start = DateTime.Now;
      var filterQuestions = project.GetQuestionsWithAnswers(false, ["filter"]);
      //var filterQuestions = project.GetQuestionsByCategory("filter");
      var end = DateTime.Now;
      if(log)
        log.LogDebug("GetFilterQuestions => GetQuestionsByCategory: " + (end-start).TotalMilliseconds);
      FilterQuestions[cacheKey] = {Questions: MetaData.CreateLocalQuestionList(filterQuestions, false), Timestamp: DateTime.Now};
      return FilterQuestions[cacheKey].Questions;
    }
    else
    {
      return FilterQuestions[cacheKey].Questions;
    }
  }
  
  static function GetDemoQuestions(report, datasourceId, log)
  {
    var project : Project = report.DataSource.GetProject(datasourceId);
    var cacheKey = [datasourceId, project.ProjectId, report.CurrentLanguage].join('_');
    if(DemographicQuestions[cacheKey] == null)// || (Config.MetaDataCacheMinutes != null && (DemographicQuestions[cacheKey].Timestamp - DateTime.Now).TotalMinutes < Config.MetaDataCacheMinutes))
    {
      var start = DateTime.Now;
      var demoQuestions = project.GetQuestionsWithAnswers(false, ["demo"]);
      //var demoQuestions = project.GetQuestionsByCategory("demo");
      var end = DateTime.Now;
      if(log)
        log.LogDebug("GetDemoQuestions => GetQuestionsByCategory: " + (end-start).TotalMilliseconds);
      DemographicQuestions[cacheKey] = {Questions: MetaData.CreateLocalQuestionList(demoQuestions, false), Timestamp: DateTime.Now};
      return DemographicQuestions[cacheKey].Questions;
    }
    else
    {
      return DemographicQuestions[cacheKey].Questions;
    }
  }
}