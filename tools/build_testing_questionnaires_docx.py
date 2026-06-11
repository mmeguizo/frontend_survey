from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs"

BLUE = "2E74B5"
DARK_BLUE = "1F4D78"
LIGHT_BLUE = "E8EEF5"
LIGHT_GRAY = "F2F4F7"
BORDER = "B8C4D6"


ACCOUNTS = [
    ("End User 1", "Alice", "alice@chmsu.edu.ph", "Password123!"),
    ("End User 2", "Bob", "bob@chmsu.edu.ph", "Password123!"),
    ("Secretary", "Secretary", "secretary@chmsu.edu.ph", "Password123!"),
    ("ITS Head", "ITS Head", "itshead@chmsu.edu.ph", "Password123!"),
    ("MIS Head", "MIS Head", "mishead@chmsu.edu.ph", "Password123!"),
    ("Admin", "Admin", "mark.meguizo@gmail.com", "Password123!"),
]

TASKS = [
    "Log in using the assigned test account.",
    "View the dashboard and check ticket status summaries.",
    "Submit either an MIS or ITS ticket.",
    "Use the AI ticket drafting or analysis feature, if available for the account.",
    "Open My Tickets and review the submitted ticket details.",
    "Track the ticket timeline, status, control number, and SLA information.",
    "Use the knowledge base or documentation page to find support information.",
    "For staff/admin roles, review, approve, assign, update, or resolve a ticket.",
    "For resolved tickets, answer the satisfaction survey.",
    "Record any errors, delays, confusing steps, or missing information.",
]

MCCALL_SECTIONS = [
    ("Correctness", [
        "The system correctly supports the required ICT ticketing process from submission to resolution.",
        "MIS and ITS ticket forms collect the necessary information for their intended request types.",
        "Ticket statuses, control numbers, timelines, and SLA details are accurate and understandable.",
        "Role-based actions such as review, approval, assignment, and resolution behave according to the workflow.",
    ]),
    ("Reliability", [
        "The system remains stable while submitting, viewing, and updating tickets.",
        "The system handles invalid, incomplete, or unusual inputs without crashing.",
        "Notifications, status updates, and dashboard counts remain consistent after ticket changes.",
        "The system preserves ticket records, user actions, and survey responses reliably.",
    ]),
    ("Efficiency", [
        "Pages load within an acceptable time during normal use.",
        "Ticket submission, approval, assignment, and resolution require a reasonable number of steps.",
        "Search, filters, analytics, and ticket lists help users find information quickly.",
        "AI-assisted features reduce user effort when preparing or analyzing tickets.",
    ]),
    ("Integrity", [
        "User roles restrict access to the correct pages, tickets, and actions.",
        "Sensitive ticket data is protected from users who should not view it.",
        "The system prevents unauthorized updates, approvals, assignments, or administrative actions.",
        "Login, logout, and session behavior are secure and appropriate for the system.",
    ]),
    ("Usability", [
        "The interface is easy to understand for users with different ICT skill levels.",
        "Labels, buttons, messages, and form instructions are clear.",
        "Users can easily identify what action to take next in the ticket workflow.",
        "Error messages and validation prompts help users correct mistakes.",
    ]),
    ("Maintainability", [
        "The system appears organized enough to support future updates and maintenance.",
        "Ticket categories, roles, workflows, and survey records can be adjusted when requirements change.",
        "The system provides enough logs, status history, or records to help diagnose issues.",
        "Documentation and user guides are sufficient for administrators and support staff.",
    ]),
    ("Flexibility", [
        "The system can support different campus offices, request types, or service categories.",
        "The workflow can adapt to changes in approval, assignment, or reporting requirements.",
        "Reports and analytics can support different management information needs.",
        "The system can accommodate future improvements such as additional AI features or integrations.",
    ]),
    ("Testability", [
        "Main functions can be tested clearly using expected inputs and outputs.",
        "Each role's permissions and workflow responsibilities can be verified during testing.",
        "The system provides visible results after each major action, such as submit, approve, assign, or resolve.",
        "Defects or unexpected behavior can be reproduced and documented.",
    ]),
    ("Portability", [
        "The system works properly on common web browsers.",
        "The interface remains usable on different screen sizes, including laptops and mobile devices.",
        "The system can be deployed or accessed in the intended institutional environment.",
        "The system can be maintained across expected hardware, network, and software conditions.",
    ]),
]

PSSUQ_SECTIONS = [
    ("System Usefulness", [
        "Overall, I am satisfied with how easy it is to use this ICT ticketing system.",
        "The system helps me submit or monitor ICT service requests effectively.",
        "I can complete ticket-related tasks quickly using this system.",
        "The steps for creating, viewing, and tracking a ticket are easy to follow.",
        "The system gives clear feedback after I perform an action.",
        "The system helps reduce the effort needed to request ICT support.",
    ]),
    ("Information Quality", [
        "The messages, labels, and instructions are clear.",
        "Error messages explain what went wrong and how I can fix it.",
        "The ticket details, status, control number, and timeline are easy to understand.",
        "The dashboard and ticket lists show the information I need.",
        "The knowledge base, documentation, or help content is useful when I need guidance.",
    ]),
    ("Interface Quality", [
        "The interface layout is clean and organized.",
        "Buttons, menus, icons, and forms are placed where I expect them to be.",
        "Text is readable and the visual design is comfortable to use.",
        "The system works well on the device I used for testing.",
        "Overall, I am satisfied with this ICT ticketing system.",
    ]),
]


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_border(cell, color=BORDER, size="6"):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = "w:{}".format(edge)
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def set_cell_margins(cell, top=80, start=120, bottom=80, end=120):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn("w:{}".format(margin)))
        if node is None:
            node = OxmlElement("w:{}".format(margin))
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_width(table, widths):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.insert(0, tbl_w)
    tbl_w.set(qn("w:type"), "dxa")
    tbl_w.set(qn("w:w"), str(sum(widths)))
    grid = table._tbl.tblGrid
    if grid is None:
        grid = OxmlElement("w:tblGrid")
        table._tbl.insert(0, grid)
    for child in list(grid):
        grid.remove(child)
    for width in widths:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)
    for row in table.rows:
        for index, width in enumerate(widths):
            if index >= len(row.cells):
                continue
            cell = row.cells[index]
            cell.width = width
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.tcW
            tc_w.type = "dxa"
            tc_w.w = width
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell)
            set_cell_border(cell)


def format_cell_text(cell, bold=False, size=9, color="000000", align=None):
    for paragraph in cell.paragraphs:
        if align is not None:
            paragraph.alignment = align
        paragraph.paragraph_format.space_after = Pt(0)
        paragraph.paragraph_format.line_spacing = 1.1
        for run in paragraph.runs:
            run.font.name = "Calibri"
            run.font.size = Pt(size)
            run.font.bold = bold
            run.font.color.rgb = RGBColor.from_string(color)


def add_table(doc, rows, headers=None, widths=None, font_size=9):
    total_rows = len(rows) + (1 if headers else 0)
    table = doc.add_table(rows=total_rows, cols=len(headers or rows[0]))
    table.style = "Table Grid"
    if headers:
        for i, text in enumerate(headers):
            table.cell(0, i).text = text
            set_cell_shading(table.cell(0, i), LIGHT_BLUE)
            format_cell_text(table.cell(0, i), bold=True, size=font_size, color=DARK_BLUE, align=WD_ALIGN_PARAGRAPH.CENTER)
    start = 1 if headers else 0
    for r_index, row in enumerate(rows, start=start):
        for c_index, text in enumerate(row):
            table.cell(r_index, c_index).text = str(text)
            align = WD_ALIGN_PARAGRAPH.LEFT if c_index == 1 else WD_ALIGN_PARAGRAPH.CENTER
            format_cell_text(table.cell(r_index, c_index), size=font_size, align=align)
    if widths:
        set_table_width(table, widths)
    doc.add_paragraph()
    return table


def add_title(doc, title, subtitle):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(title)
    run.font.name = "Calibri"
    run.font.size = Pt(20)
    run.font.bold = True
    run.font.color.rgb = RGBColor.from_string(BLUE)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(10)
    run = p.add_run(subtitle)
    run.font.name = "Calibri"
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor.from_string("555555")


def add_section_heading(doc, text, level=1):
    p = doc.add_paragraph()
    p.style = "Heading {}".format(level)
    p.add_run(text)
    return p


def add_note_box(doc, title, lines):
    table = doc.add_table(rows=1, cols=1)
    table.style = "Table Grid"
    cell = table.cell(0, 0)
    set_cell_shading(cell, LIGHT_GRAY)
    set_table_width(table, [9360])
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(title)
    run.bold = True
    run.font.color.rgb = RGBColor.from_string(DARK_BLUE)
    for line in lines:
        p = cell.add_paragraph(line)
        p.paragraph_format.space_after = Pt(2)
    for paragraph in cell.paragraphs:
        for run in paragraph.runs:
            run.font.name = "Calibri"
            run.font.size = Pt(9)
    doc.add_paragraph()


def setup_document(title):
    doc = Document()
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(11)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.10

    for name, size, color, before, after in [
        ("Heading 1", 16, BLUE, 16, 8),
        ("Heading 2", 13, BLUE, 12, 6),
        ("Heading 3", 12, DARK_BLUE, 8, 4),
    ]:
        style = styles[name]
        style.font.name = "Calibri"
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(color)
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True

    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer.text = "CHMSU ICT Support Ticketing System - {}".format(title)
    for run in footer.runs:
        run.font.name = "Calibri"
        run.font.size = Pt(8)
        run.font.color.rgb = RGBColor.from_string("555555")
    return doc


def add_accounts(doc):
    add_section_heading(doc, "Testing Accounts and Credentials", 1)
    p = doc.add_paragraph("Please use the following test accounts to access the CHMSU Intelligent Service Request Monitoring and Analysis Platform.")
    p.paragraph_format.keep_with_next = True
    add_table(
        doc,
        ACCOUNTS,
        headers=["Role", "Name", "Email", "Password"],
        widths=[1800, 1800, 3720, 2040],
        font_size=8,
    )


def add_tasks_and_scale(doc):
    add_section_heading(doc, "Before Answering", 1)
    add_table(
        doc,
        [(i + 1, task) for i, task in enumerate(TASKS)],
        headers=["No.", "Suggested Test Task"],
        widths=[800, 8560],
        font_size=9,
    )
    add_table(
        doc,
        [
            ("5", "Strongly Agree / Excellent"),
            ("4", "Agree / Good"),
            ("3", "Neutral / Fair"),
            ("2", "Disagree / Poor"),
            ("1", "Strongly Disagree / Very Poor"),
        ],
        headers=["Rating", "Interpretation"],
        widths=[1600, 7760],
        font_size=9,
    )


def add_profile_table(doc, fields):
    add_table(doc, [(field, "") for field in fields], headers=["Field", "Response"], widths=[2600, 6760], font_size=9)


def add_rating_section(doc, title, statements, start_number):
    add_section_heading(doc, title, 2)
    rows = []
    number = start_number
    for statement in statements:
        rows.append((number, statement, "", "", "", "", ""))
        number += 1
    add_table(doc, rows, headers=["No.", "Statement", "5", "4", "3", "2", "1"], widths=[600, 5700, 612, 612, 612, 612, 612], font_size=8)
    return number


def add_comment_lines(doc, questions):
    add_section_heading(doc, "Comments", 1)
    for question in questions:
        p = doc.add_paragraph()
        p.paragraph_format.keep_with_next = True
        run = p.add_run(question)
        run.bold = True
        run.font.color.rgb = RGBColor.from_string(DARK_BLUE)
        table = doc.add_table(rows=3, cols=1)
        table.style = "Table Grid"
        set_table_width(table, [9360])
        for row in table.rows:
            cell = row.cells[0]
            cell.text = ""
            set_cell_margins(cell, top=120, bottom=120, start=120, end=120)
            set_cell_border(cell, color="D0D7E2")


def add_scoring(doc, rows, overall_label):
    add_section_heading(doc, "Scoring Template", 1)
    add_table(doc, rows, headers=["Subscale / Factor", "Item Numbers", "Total Score", "Mean"], widths=[3000, 2300, 2030, 2030], font_size=8)
    add_section_heading(doc, "Interpretation Guide", 2)
    add_table(
        doc,
        [
            ("4.21 - 5.00", "Excellent / Strongly Acceptable"),
            ("3.41 - 4.20", "Good / Acceptable"),
            ("2.61 - 3.40", "Fair / Needs Minor Improvement"),
            ("1.81 - 2.60", "Poor / Needs Major Improvement"),
            ("1.00 - 1.80", "Very Poor / Not Acceptable"),
        ],
        headers=["Mean Range", "Interpretation"],
        widths=[2500, 6860],
        font_size=9,
    )
    add_note_box(
        doc,
        "Recommended Computation",
        [
            "Add all item ratings under each {}.".format(overall_label.lower()),
            "Divide the total by the number of answered items.",
            "Compute the grand mean for all respondents.",
            "Summarize repeated comments and list the top issues to fix before final deployment.",
        ],
    )


def build_pssuq():
    doc = setup_document("PSSUQ User Questionnaire")
    add_title(
        doc,
        "PSSUQ User Usability Questionnaire",
        "CHMSU Intelligent Service Request Monitoring and Analysis Platform",
    )
    add_note_box(
        doc,
        "Respondents",
        [
            "For 10 end users who will test the ICT Support Ticketing System.",
            "Use this form after the respondent completes the suggested hands-on tasks.",
        ],
    )
    add_accounts(doc)
    doc.add_section(WD_SECTION.NEW_PAGE)
    add_tasks_and_scale(doc)
    add_section_heading(doc, "User Profile", 1)
    add_profile_table(
        doc,
        [
            "User Code",
            "Age Range",
            "User Type",
            "ICT Skill Level",
            "Date Tested",
            "Device Used",
        ],
    )
    n = 1
    for title, statements in PSSUQ_SECTIONS:
        n = add_rating_section(doc, title, statements, n)
    add_comment_lines(
        doc,
        [
            "What did you like most about the system?",
            "Which part was confusing or difficult to use?",
            "Did you encounter any error or problem? Please describe.",
            "What improvement would make the system better?",
            "Would you recommend using this system for ICT support requests? [ ] Yes  [ ] No  [ ] Not sure",
        ],
    )
    add_scoring(
        doc,
        [
            ("System Usefulness", "1-6", "", ""),
            ("Information Quality", "7-11", "", ""),
            ("Interface Quality", "12-15", "", ""),
            ("Overall Satisfaction", "1-16", "", ""),
        ],
        "subscale",
    )
    path = OUT_DIR / "PSSUQ_User_Questionnaire.docx"
    doc.save(path)
    return path


def build_mccall():
    doc = setup_document("McCall Expert Questionnaire")
    add_title(
        doc,
        "McCall's Software Quality Model Questionnaire",
        "CHMSU Intelligent Service Request Monitoring and Analysis Platform",
    )
    add_note_box(
        doc,
        "Respondents",
        [
            "For 5 expert evaluators who will assess the ICT Support Ticketing System.",
            "Suggested experts include ICT staff, software developers, systems analysts, IT instructors, QA testers, or administrators.",
        ],
    )
    add_accounts(doc)
    doc.add_section(WD_SECTION.NEW_PAGE)
    add_tasks_and_scale(doc)
    add_section_heading(doc, "Expert Profile", 1)
    add_profile_table(
        doc,
        [
            "Expert Code",
            "Area of Expertise",
            "Years of Experience",
            "Date Tested",
            "Role/Test Account Used",
        ],
    )
    n = 1
    for title, statements in MCCALL_SECTIONS:
        n = add_rating_section(doc, title, statements, n)
    add_comment_lines(
        doc,
        [
            "What are the strongest qualities of the system?",
            "What defects, risks, or weaknesses should be fixed first?",
            "What features or improvements do you recommend?",
            "Overall expert recommendation: [ ] Acceptable  [ ] Acceptable with minor revisions  [ ] Needs major revisions",
        ],
    )
    scoring_rows = []
    start = 1
    for title, statements in MCCALL_SECTIONS:
        end = start + len(statements) - 1
        scoring_rows.append((title, "{}-{}".format(start, end), "", ""))
        start = end + 1
    scoring_rows.append(("Overall", "1-36", "", ""))
    add_scoring(doc, scoring_rows, "quality factor")
    path = OUT_DIR / "McCalls_Expert_Questionnaire.docx"
    doc.save(path)
    return path


def build_tester_record_sheet():
    doc = setup_document("Tester Record Sheet")
    add_title(
        doc,
        "Tester Record Sheet",
        "CHMSU Intelligent Service Request Monitoring and Analysis Platform",
    )
    add_note_box(
        doc,
        "Purpose",
        [
            "Use this sheet to record the identities and signatures of testers while keeping questionnaire responses organized by tester code.",
            "Match each signed tester code with the completed questionnaire form: E1-E5 for expert evaluators and U1-U10 for end users.",
        ],
    )

    add_section_heading(doc, "Testing Accounts and Credentials", 1)
    p = doc.add_paragraph("Assign the appropriate test account to each respondent during the evaluation session.")
    p.paragraph_format.keep_with_next = True
    add_table(
        doc,
        ACCOUNTS,
        headers=["Role", "Name", "Email", "Password"],
        widths=[1800, 1800, 3720, 2040],
        font_size=8,
    )

    add_section_heading(doc, "Expert Evaluators", 1)
    expert_rows = []
    for index in range(1, 6):
        expert_rows.append(("E{}".format(index), "", "", "", "", "", ""))
    add_table(
        doc,
        expert_rows,
        headers=["Code", "Full Name", "Area of Expertise", "Office/Role", "Account Used", "Date", "Signature"],
        widths=[700, 1700, 1900, 1500, 1450, 1000, 1110],
        font_size=7,
    )

    add_section_heading(doc, "End Users", 1)
    user_rows = []
    for index in range(1, 11):
        user_rows.append(("U{}".format(index), "", "", "", "", "", ""))
    add_table(
        doc,
        user_rows,
        headers=["Code", "Full Name", "User Type/Office", "Device Used", "Account Used", "Date", "Signature"],
        widths=[700, 1800, 1900, 1400, 1400, 1000, 1160],
        font_size=7,
    )

    add_section_heading(doc, "Evaluator Confirmation", 1)
    add_note_box(
        doc,
        "Confirmation Statement",
        [
            "By signing this sheet, the tester confirms that they used the assigned test account, performed the testing tasks, and completed the corresponding questionnaire honestly based on their experience.",
            "Testing facilitator: ________________________________    Date: ____________________",
        ],
    )
    path = OUT_DIR / "Tester_Record_Sheet.docx"
    doc.save(path)
    return path


def main():
    OUT_DIR.mkdir(exist_ok=True)
    paths = [build_pssuq(), build_mccall(), build_tester_record_sheet()]
    for path in paths:
        print(path)


if __name__ == "__main__":
    main()
