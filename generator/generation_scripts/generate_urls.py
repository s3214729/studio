import sys
from generator import GenerateTarget
from utils.getters_table import get_page_names_on_app_from_table, get_list_of_section_components_on_app_from_table_with_app_name

# creates a urls.py file in str(sys.argv[1]) = projectsname/ str(sys.argv[2]) = appname/ folder by filling jinja2template with data
# takes run_cls as data which is first created by extracting classes from ../../tests/runtime.json
# Template is searched for in the templates/ dir
def generate(table, project_name, app_name, is_auth_app):
    targetfile = "urls.py"

    data = {
        "app_name": app_name,
        "section_components" : get_list_of_section_components_on_app_from_table_with_app_name(table, app_name),
        "pages" : get_page_names_on_app_from_table(table, app_name)
        }
    GenerateTarget(project_name,app_name,targetfile,data,is_auth_app)

def main():

    if (len(sys.argv) != 4 or str(sys.argv[1]) == '' or str(sys.argv[2]) == ''  or str(sys.argv[3]) == ''  ):
        raise Exception("wrong arguments, call with: table project_name app_name")
    
    table = str(sys.argv[1]) 
    project_name = str(sys.argv[2]) 
    app_name = str(sys.argv[3]) 

    generate(table, project_name, app_name, False)

if __name__ == "__main__":
    main()