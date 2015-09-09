class TimeSeriesHeader
{
  private var _report;
  private var _state;
  private var _table;
  private var _log;
  private var _trendUnit;
  private var _trendInterval;
  const TimeVariableHeaderId = "dt";
  
  function TimeSeriesHeader(report, state, table, parameterInfo, log)
  {
    _report = report;
    _state = state;
    _table = table;
    _trendUnit = ParamUtil.Selected (report, state, parameterInfo.UnitName);
    _trendInterval = ParamUtil.Selected (_report, _state, parameterInfo.IntervalName);
    _log = log;
  }
  
  function CreateBaseTimeseriesExpression(totals)
  {
    return Config.DateVariableId + "{id:" + TimeVariableHeaderId + "; totals:" + totals + "}";
  }
  
  function SetTimeUnitAndTrending()
  {
    var headerQuestion : HeaderQuestion = HelperUtil.GetHeaderById(_table, TimeVariableHeaderId);
    headerQuestion.TimeSeries.Time1 = TimeseriesTimeUnitType.Year;
    headerQuestion.TimeSeries.Time2 = GetTimeseriesUnit();
    if(_trendUnit.Unit == RollingUnitType.Day)
      headerQuestion.TimeSeries.Time3 = TimeseriesTimeUnitType.DayOfMonth;
    if (_trendInterval.Interval != null) 
    {
      var rollingTimeSeries = CreateRollingTimeSeries();
      headerQuestion.TimeSeries.RollingTimeseries = rollingTimeSeries;
    }
    headerQuestion.TimeSeries.FiscalCalendarId = new Guid("ffffffff-ffff-ffff-ffff-ffffffffffff");
  }
  
  function GetTimeseriesUnit()
  {
    switch( _trendUnit.Unit )
    {
      case RollingUnitType.Year:
        return TimeseriesTimeUnitType.Undefined; 
      case RollingUnitType.Quarter:
        return TimeseriesTimeUnitType.Quarter;
      case RollingUnitType.Month:
        return TimeseriesTimeUnitType.Month;
      case RollingUnitType.Week:
        return TimeseriesTimeUnitType.Week;
      case RollingUnitType.Day:
        return TimeseriesTimeUnitType.Month;
      default:
        return null;    
    }
  }
  
  function CreateRollingTimeSeries(selected, interval)
  {
    var rollingTimeSeries : RollingTime = new RollingTime();
    rollingTimeSeries.Enabled = true;
    rollingTimeSeries.Unit = _trendUnit.Unit;
    rollingTimeSeries.To = _trendUnit.Delta;
    rollingTimeSeries.From = _trendUnit.Delta - parseInt (_trendInterval.Interval);
    return rollingTimeSeries;
  }
  
  function SetReversedAndFlatLayout()                                
  {
    var headerQuestion : HeaderQuestion = HelperUtil.GetHeaderById(_table, TimeVariableHeaderId);
    headerQuestion.TimeSeries.FlatLayout = true;
    headerQuestion.TimeSeries.ReverseOrder = true;
  }
}