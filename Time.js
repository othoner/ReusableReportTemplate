class TrendUnit 
{
  static const Month = "1";
  static const Quarter = "2";
  static const Year = "3";
}

class TimePeriod 
{
  static const Custom = 0;
  static const YearToDate = 1;
  static const PreviousYear = 2;
  static const QuarterToDate = 3;
  static const PreviousQuarter = 4;
  static const MonthToDate = 5;
  static const PreviousMonth = 6;
  static const Yesterday = 7;
}


class Time 
{
  static var Years = DefaultTime.GetYears();
  static var mos = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  static function GetMonthArray(log) 
  {
		var months = [];
		for (var i=0; i<Time.Years.length; ++i) {
			var y = Time.Years[i];
			for (var j=0; j<y.Quarters.length; ++j) {
				var q = y.Quarters[j];
				q.Parent = y;
				for (var k=0; k<q.Months.length; ++k) {
					var m = q.Months[k];
					m.Parent = q;
					if (months.length > 0) months[months.length-1].EndDate = m.StartDate;
					months.push (m);
				}
			}
		}
		return months;
	}
	
	static function GetMonth(date, delta, log) {
		// return Month object based on date provided
		var months = GetMonthArray(log).reverse();
		
		for (var i=0; i<months.length; ++i) {
			var x = months[i].StartDate.split("-");
			var year = parseInt(x[0]);
			var month = parseInt(x[1])-1;
			var d = parseInt(x[2]);
			if (date > new Date(year,month,d)) return months[i-delta];
		}
	}
	
	static function GetQuarter(date, delta, log) {
		return GetMonth(date, delta*3, log).Parent;
	}

	static function GetYear(date, delta, log) {
		return GetMonth(date, delta*12, log).Parent.Parent;
	}

	// Labels

	static function GetLabel(period) {
		if (period == null) return '';
		
		if (period.CustomLabel != null) return period.CustomLabel;
		
		if (period.Quarters != null) return GetYearLabel(period);
		if (period.Months != null) return GetQuarterYearLabel(period);
		return GetMonthYearLabel(period);
	}

	static function GetMonthLabel(month) {
		return mos[parseInt(month.Id-1)];
	}

	static function GetYearLabel(year) {
		var fullyear = year.Id;
		return CalendarPrefix() + fullyear.substring(fullyear.length-2, fullyear.length);
	}

	static function GetQuarterYearLabel(quarter) {
		var fullyear = quarter.Parent.Id;
		return [quarter.Id, CalendarPrefix() + fullyear.substring(fullyear.length-2, fullyear.length)].join (" ");
	}

	static function GetMonthYearLabel(month) {
		var fullyear = month.Parent.Parent.Id;
		return [mos[parseInt(month.Id-1)].substring(0,3), CalendarPrefix() + fullyear.substring(fullyear.length-2, fullyear.length)].join (" ");
	}
	
	static function CalendarPrefix() {
		return (Config.Time.CalendarType == CalendarType.Fiscal) ? 'FY': '\'';
	}

	// Expressions 

	static function GetSegmentExpression2(period, variable_id, report) 
    {
		return '[SEGMENT]{label:' + report.TableUtils.EncodeJsString(Time.GetLabel(period)) + '; expression:' + report.TableUtils.EncodeJsString(Time.GetExpression(period, variable_id)) + '}';
		if (period.Quarters != null) return GetYearExpression(period, variable_id);
		if (period.Months != null) return GetQuarterExpression(period, variable_id);
		return GetMonthExpression(period, variable_id);
	}
	
	static function GetExpression(period, variable_id) {
		if (period == null) return '';
		
		if (period.CustomExpression != null) return period.CustomExpression;

		if (period.Quarters != null) return GetYearExpression(period, variable_id);
		if (period.Months != null) return GetQuarterExpression(period, variable_id);
		return GetMonthExpression(period, variable_id);
	}

	static function GetYearExpression(year, variable_id) {
		if (year.CustomExpression != null) return year.CustomExpression;

		var first_quarter = year.Quarters[0];
		var last_quarter = year.Quarters[year.Quarters.length-1];
		
		var first_month =  first_quarter.Months[0];
		var last_month = last_quarter.Months[last_quarter.Months.length-1];
		
		var o=[];
		o.push (variable_id + '>= TODATE("' + first_month.StartDate + '")');
		if (last_month.EndDate != null) o.push (variable_id + '< TODATE("' + last_month.EndDate + '")');
		return o.join (" AND " );
	}

	static function GetQuarterExpression(quarter, variable_id) {
		if (quarter.CustomExpression != null) return quarter.CustomExpression;

		var first_month =  quarter.Months[0];
		var last_month = quarter.Months[quarter.Months.length-1];
		var o=[];
		o.push (variable_id + '>= TODATE("' + first_month.StartDate + '")');
		if (last_month.EndDate != null) o.push (variable_id + '< TODATE("' + last_month.EndDate + '")');
		return o.join (" AND " );
	}

	static function GetMonthExpression(month, variable_id) {
		// return Reportal Query Expression
		// Syntax: interview_start > TODATE("2011-04-20")
		var o = [];
		
		// Check for custom expression
		if (month.CustomExpression != null) return month.CustomExpression;
		
		o.push (variable_id + '>= TODATE("' + month.StartDate + '")');
		if (month.EndDate != null) o.push (variable_id + '< TODATE("' + month.EndDate + '")');
		return o.join (" AND " );
	}


	// Report Periods 

	static function GetODPeriods(state, param_name) {
		var code = ParamUtil.GetParamCode(state, param_name);

		var periods = [];
		var now = new Date();
		var time_code = parseInt(code);
		var yesterday = new Date();
		yesterday.setDate (now.getDate() - 1);
		var YYYYMMDD = [
			yesterday.getFullYear(),
			(yesterday.getMonth()+1<10) ? ('0' + (yesterday.getMonth()+1)) : (yesterday.getMonth()+1),
			(yesterday.getDate()<10) ? ('0' + yesterday.getDate()) : (yesterday.getDate())
		].join('-');

		
		switch (time_code) {
			case TimePeriod.Yesterday: periods = [{Id:'Custom', CustomLabel:'Yesterday', CustomExpression: 'interview_end = TODATE("' + YYYYMMDD + '")'}]; break;
			case TimePeriod.YearToDate: periods = [GetYear (now, 0), GetYear (now, -1)]; break;
			case TimePeriod.PreviousYear: periods = [GetYear (now, -1), GetYear (now, -2)]; break;
			case TimePeriod.QuarterToDate: periods = [GetQuarter (now, 0), GetQuarter (now, -1), GetQuarter (now, -4)]; break;
			case TimePeriod.PreviousQuarter: periods = [GetQuarter (now, -1), GetQuarter (now, -2), GetQuarter (now, -5)];break;
			case TimePeriod.MonthToDate: periods = [GetMonth (now, 0), GetMonth (now, -1), GetMonth (now, -12)]; break;
			case TimePeriod.PreviousMonth: periods = [GetMonth (now, -1), GetMonth (now, -2), GetMonth (now, -13)]; break;
		}	
		return periods;
	}

	static function GetPreviousYearPeriod(state) {
		var code = ParamUtil.GetParamCode(state, 'pTimePeriod');

		var period;
		var now = new Date();
		var time_code = parseInt(code);
		
		switch (time_code) {
			case TimePeriod.YearToDate: period = GetYear (now, -1); break;
			case TimePeriod.PreviousYear: period = GetYear (now, -2); break;
			case TimePeriod.QuarterToDate: period = GetQuarter (now, -4); break;
			case TimePeriod.PreviousQuarter: period = GetQuarter (now, -5);break;
			case TimePeriod.MonthToDate: period = GetMonth (now, -12); break;
			case TimePeriod.PreviousMonth: period = GetMonth (now, -13); break;
		}	
		return period;
	}
	
	
	static function GetComparisonPeriod(state)  {
		if (ParamUtil.GetParamCode(state, 'pComparisonReportPeriod') == null) return null;

		// Check if (None) is selected
		var comparions_units_delta = parseInt (ParamUtil.GetParamCode(state, 'pComparisonReportPeriod'));
		if (comparions_units_delta == 0) return null;

		// If Current Report Period = (Show All), then comparison period
		var codes = ParamUtil.GetParamCode(state, 'pCurrentReportPeriod').split('_');
		var unit = codes[0]; // M, Q, Y or 0
		if (unit == "0") return null;
		
		var period;
		var delta = parseInt(codes[1]) + comparions_units_delta;
		var now = new Date();

		switch (unit) {
			case 'M': period = GetMonth (now, -delta); break;
			case 'Q': period = GetQuarter (now, -delta); break;
			case 'Y': period = GetYear (now, -delta); break;
		}
		return period;
	}	
		
}

class DefaultTime {

	static function GetYears() {
		var now = new Date();
		var years = [];
		var year_count = 10;
		
		var current_year = now.getFullYear();
		for (var i=0; i<year_count; ++i) {
			var yr = (current_year-year_count) + i + 1;
			var year = {};
			year.Id = yr.toString();
			year.Quarters = [
				{
					Id:'Q1', 
					Months: [
						{Id:'01', StartDate: yr+'-01-01'},
						{Id:'02', StartDate: yr+'-02-01'},
						{Id:'03', StartDate: yr+'-03-01'}
					]
				},
				{
					Id:'Q2', 
					Months: [
						{Id:'04', StartDate: yr+'-04-01'},
						{Id:'05', StartDate: yr+'-05-01'},
						{Id:'06', StartDate: yr+'-06-01'}
					]
				},
				{
					Id:'Q3', 
					Months: [
						{Id:'07', StartDate: yr+'-07-01'},
						{Id:'08', StartDate: yr+'-08-01'},
						{Id:'09', StartDate: yr+'-09-01'}
					]
				},
				{
					Id:'Q4', 
					Months: [
						{Id:'10', StartDate: yr+'-10-01'},
						{Id:'11', StartDate: yr+'-11-01'},
						{Id:'12', StartDate: yr+'-12-01'}
					]
				}
			];
			years.push (year);
		}
		return years;
	}
}

class TimeUnit {

	static const None=0;
	static const Year=1;
	static const Quarter=2;
	static const Month=3;
}


class CalendarType {
	static const Default=1;
	static const Fiscal=2;
}



class TimeUtils {

	static function ReportPeriod_ParamValues(state){
		var param_values = [];
		var now = new Date();
		var time_unit = ParamUtil.GetParamCode(state, 'pTimeUnit');

		// No time filter
		param_values.push ( {Code:0, Label: '(Show All)'} );

		switch (parseInt(time_unit)) {

			case TimeUnit.Month:
				// Current Month
				try {
				var month_now = Time.GetMonth(now, 0);
				param_values.push ({Code:'M_0', Label:'This Month [' + Time.GetLabel(month_now) + ']'});
				} catch(e){}

				// Previous Months 
				for (var i=0; i<24; ++i) {
					try {
						var month_prev = Time.GetMonth(now, -(i+1));
						param_values.push ({Code:'M_' + (i+1), Label:'(M-' + (i+1) + ') [' + Time.GetLabel(month_prev) + ']'});
					} catch(e){}
				}
				break;

			case TimeUnit.Quarter:
				// Current Qtr
				try {
				var quarter_now = Time.GetQuarter(now, 0);
				param_values.push ({Code:'Q_0', Label:'This Quarter [' + Time.GetLabel(quarter_now) + ']'});
				} catch(e){}

				// Previous Qtrs
				for (var i=0; i<8; ++i) {
					try {
						var quarter_prev = Time.GetQuarter(now, -(i+1));
						param_values.push ({Code:'Q_' + (i+1), Label:'(Q-' + (i+1) + ') [' + Time.GetLabel(quarter_prev) + ']'});
					} catch(e){}
				}
				break;
				
			case TimeUnit.Year:
				// Current Year
				try {
				var year_now = Time.GetYear(now, 0);
				param_values.push ({Code:'Y_0', Label:'This Year [' + Time.GetLabel(year_now) + ']'});
				} catch(e){}

				// Prev Years
				for (var i=0; i<6; ++i) {
					try {
						var year_prev = Time.GetYear(now, -(i+1));
						param_values.push ({Code:'Y_' + (i+1), Label:'(Y-' + (i+1) + ') [' + Time.GetLabel(year_prev) + ']'});
					} catch(e){}
				}
				break;
		}
		return param_values;
	}

	static function GetPeriod (state, time, delta) {
		var time_unit = ParamUtil.GetParamCode(state, 'pTimeUnit');
		switch (parseInt(time_unit)) {
			case TimeUnit.Year: return Time.GetYear(time, delta); break;
			case TimeUnit.Quarter: return Time.GetQuarter(time, delta); break;
			case TimeUnit.Month: return Time.GetMonth(time, delta); break;
		}
		return null;
	}
	
	static function GetLabel (time_unit) {
		switch (parseInt(time_unit)) {
			case TimeUnit.Year: return "Year"; break;
			case TimeUnit.Quarter: return "Quarter"; break;
			case TimeUnit.Month: return "Month"; break;
		}
	}

	static function GetDelta (state) {
		var include_lastcompleted = (ParamUtil.GetParamCode(state, 'pTimeIncludeLastCompleted') == '1');
		return  include_lastcompleted ? -1 : -2;
	}
	
	static function TimeSeriesExpression2(state, report) 
    {
		var delta = GetDelta (state);
		var unit_count = TimeUnitCount(state);
		var now = new Date();
		var tmp = [];
		for (var i=0; i<unit_count; ++i) {
			try {
				var period = TimeUtils.GetPeriod(state, now, -i + delta);
				tmp.push ("[SEGMENT]{" +
					"expression:" + report.TableUtils.EncodeJsString(Time.GetExpression(period, Config.Time.VariableId)) + ";" +
					"label:" + report.TableUtils.EncodeJsString(Time.GetLabel(period)) +
					"}"
				);
			}
			catch (e) {}
		}
		return "(" + tmp.reverse().join("+") + ")";
	}
	
	static function TimeUnitCount(state) 
    {
      return parseInt('0' + ParamUtil.GetParamCode(state, 'pTime'),10);
    }

}