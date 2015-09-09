class TimeHelper 
{
  static var CustomTimePeriods = 3;
  static var DateParameterNames = ['StartDate', 'EndDate'];

  static function CreateTrendHeader(report, trend, interval)
  {
    var project : Project = report.DataSource.GetProject(DS.Main);
    var questionnaireElement : QuestionnaireElement = new QuestionnaireElement(project, Config.DateVariableId);
    var headerQuestion : HeaderQuestion = new HeaderQuestion(questionnaireElement);
    headerQuestion.TimeSeries.FiscalCalendarId = new Guid("ffffffff-ffff-ffff-ffff-ffffffffffff");
    headerQuestion.ShowTotals = false;
    headerQuestion.TimeSeries.RollingTimeseries = ScorecardTable.CreateRollingTimeSeries(trend, interval);
    headerQuestion.TimeSeries.Time1 = TimeseriesTimeUnitType.Year;
    if(trend.Unit != RollingUnitType.Year)
      headerQuestion.TimeSeries.Time2 = ScorecardTable.GetTimeseriesUnit(trend);
    headerQuestion.HeaderId = "dt";   
    return headerQuestion;
  }
    
  static function TimeseriesExpression(state, dateVariableId, report) 
  {
    // Insert Date Segments for selected period (and possible comparison periods)
	var expression = '';
	var firstLabel = '';
    var code = ParamUtil.GetParamCode(state, 'TIMEPERIOD');
    switch (parseInt(code))
    {    
      // Check for Custom   
      case TimePeriod.Custom:
        expression = TimeHelper.GetCustomPeriods(state, dateVariableId, report);
        return {
          Expression: expression,
          FirstLabel: firstLabel
        };
      default:
        return {
          Expression: Config.DateVariableId + '{id:dt; totals:false}',
          FirstLabel: firstLabel
        };
      } 
  }
  
  static function GetCustomPeriods(report, state, dateVariable, log) 
  {
    var expressionSections = [];
    for (var i = 1; i <= TimeHelper.CustomTimePeriods; ++i) 
    {
      var expressionSection = GetCustomPeriod (report, state, dateVariable, i, log);
      if (expressionSection != null && expressionSection != '')
        expressionSections.push ('(' + expressionSection + ')');
    }
    return '(' + expressionSections.join('+') + ')';	
  }
	
  static function GetCustomPeriod (report, state, dateVariable, idx, log) 
  {
    var suffix = idx;
    var startParameterName = DateParameterNames[0] + suffix;
    var endParameterName = DateParameterNames[1] + suffix;
		
    var startDate : DateTime = GetDateParameterValue(state, startParameterName);
    var endDate : DateTime = GetDateParameterValue(state, endParameterName);
      
    if(startDate != null && endDate != null)
    {
      var label = CreateCustomDateLabel(startDate, endDate);
      var startDateFormatted = startDate.ToString("yyyy-MM-dd");
      var endDateFormatted = endDate.ToString("yyyy-MM-dd");
      var filter = CreateFilter(startDateFormatted, endDateFormatted, dateVariable);		
      return CreateSegmentExpression(report, label, filter);
    }
    else
      return null;
  }
  
  static function CreateSegmentExpression(report, label, filter)
  {
    return "([SEGMENT]{label:" + report.TableUtils.EncodeJsString( label ) + ";expression:" + report.TableUtils.EncodeJsString( filter ) + "})";
  }
  
  static function CreateFilter(startDateFormatted, endDateFormatted, dateVariable)
  {
    var filterExpressionSections = [];
    filterExpressionSections.push (dateVariable + '>= TODATE("' + startDateFormatted + '")');
    filterExpressionSections.push (dateVariable + '<= TODATE("' + endDateFormatted + '")');
    return filterExpressionSections.join(' AND ');
  }
  
  static function GetDateParameterValue(state, parameterName)
  {
    return state.Parameters.IsNull(parameterName)
			? null
			: state.Parameters.GetDate(parameterName);
  }
  
  static function CreateCustomDateLabel(startDate, endDate)
  {
    if (startDate == null && endDate == null)
      return '(No Time Filter)'
    else 
    {
      var labelSections = [];
      labelSections.push ( startDate == null ? '' : startDate.ToShortDateString() );
      labelSections.push ( endDate == null ? '' : endDate.ToShortDateString() );
      return labelSections.join (' - ');
    }    
  }
}