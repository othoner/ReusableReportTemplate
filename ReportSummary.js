class ReportSummary
{
  private var _report;
  private var _ds;
  private var _project;
  private var _log;
  
  function ReportSummary(report, log)
  {
    _report = report;
    _ds = DS.Main;
    _project = report.DataSource.GetProject(_ds);
    _log = log;
  }
  
  function CreateSummaryText()
  {
    var overViewTable = [];
    overViewTable.push("<table>");
    overViewTable.push("  <tbody>");
    overViewTable.push("    <tr style='height:80px'>");
    overViewTable.push("      <td>Report Name</td>");
    overViewTable.push("      <td style='padding-left:50px'>");
    overViewTable.push("        " + _report.Name);
    overViewTable.push("      </td>");
    overViewTable.push("    </tr>");
    overViewTable.push("    <tr style='height:80px'>");
    overViewTable.push("      <td>Survey</td>");
    overViewTable.push("      <td style='padding-left:50px'>");
    overViewTable.push("        "  + FindProjectIdAndName());
    overViewTable.push("      </td>");
    overViewTable.push("    </tr>");
    overViewTable.push("    <tr style='height:80px'>");
    overViewTable.push("      <td>Completed Surveys</td>");
    overViewTable.push("      <td style='padding-left:50px'>");
    overViewTable.push("        " + GetReportBase());
    overViewTable.push("      </td>");
    overViewTable.push("    </tr>");
    overViewTable.push("    <tr style='height:80px'>");
    overViewTable.push("      <td>Project Status</td>");
    overViewTable.push("      <td style='padding-left:50px'>");
    overViewTable.push("        " + GetProjectStatus());
    overViewTable.push("      </td>");
    overViewTable.push("    </tr>");
    overViewTable.push("  </tr>");
    overViewTable.push("</table>");
    return overViewTable.join("\n");
  }
  
  function FindProjectIdAndName()
  {
    return [_project.ProjectId, _project.ProjectName].join (' - ');
  }
  
  function GetReportBase()
  {
    var expression = '[SEGMENT]^[N]';
    var jsonTable = _report.TableUtils.GenerateTableFromExpression(_ds, expression, TableFormat.Json);
    var table;
    eval('table = ' + jsonTable);
    var base = parseInt(table.data[0][0].values.basecount);
    var formattedBase = AddThousandsDelimiter(base);
    return formattedBase
  }
  
  private function AddThousandsDelimiter(base)
  {
    return base.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  
  function GetProjectStatus()
  {
    switch(_project.ProjectStatus)
    {
      case ProjectStatus.Online:
        return "Live";
      case ProjectStatus.Closed:
        return "Closed";
      case ProjectStatus.NotStarted:
        return "Not Started";
      case ProjectStatus.NA:
        return "Not applicable";
    }
  }
}