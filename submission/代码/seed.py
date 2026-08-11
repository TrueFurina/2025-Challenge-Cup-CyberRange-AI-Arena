from app import app
from backend.extensions import db
from backend.models import Attack, Defense, Tool, Vulnerability

def seed_data():
    with app.app_context():
        # Clear existing data
        db.session.query(Attack).delete()
        db.session.query(Defense).delete()
        db.session.query(Tool).delete()
        db.session.query(Vulnerability).delete()

        # Add new data
        attacks = [
            Attack(name='SQL Injection', description='A code injection technique that might destroy your database.', cwe_id='CWE-89'),
            Attack(name='Cross-Site Scripting (XSS)', description='A type of security vulnerability that can be found in some web applications.', cwe_id='CWE-79'),
            Attack(name='Phishing', description='The fraudulent attempt to obtain sensitive information or data.', cwe_id='CWE-594'),
            Attack(name='Command Injection', description='Execute arbitrary commands on the host operating system via vulnerable application.', cwe_id='CWE-78'),
            Attack(name='Local File Inclusion (LFI)', description='Include local files on the server, often leading to RCE or information disclosure.', cwe_id='CWE-98'),
            Attack(name='Brute Force Attack', description='Systematically guess credentials to gain unauthorized access.', cwe_id='CWE-307'),
            Attack(name='WebShell Upload', description='Upload malicious script files to gain persistent control of the server.', cwe_id='CWE-434'),
            Attack(name='Server-Side Request Forgery (SSRF)', description='Forge requests from the server to access internal resources.', cwe_id='CWE-918'),
            Attack(name='Cross-Site Request Forgery (CSRF)', description='Force authenticated users to execute unwanted actions.', cwe_id='CWE-352'),
            Attack(name='Unsafe Deserialization', description='Exploit insecure object deserialization to execute arbitrary code.', cwe_id='CWE-502'),
            Attack(name='Weak Password & Default Credentials', description='Use default or weak credentials to log in to services.', cwe_id='CWE-521'),
            Attack(name='Man-in-the-Middle (MITM)', description='Intercept and alter communication between two parties.', cwe_id='CWE-319'),
        ]

        defenses = [
            Defense(name='Input Validation', description='Constraining the input that is allowed.', category='Data Validation'),
            Defense(name='Parameterized Queries', description='A means of preprocessing SQL queries to prevent SQL injection.', category='Database Security'),
            Defense(name='Content Security Policy (CSP)', description='An added layer of security that helps to detect and mitigate certain types of attacks, including XSS.', category='Web Security'),
            Defense(name='Web Application Firewall (WAF)', description='Filter and monitor HTTP traffic to block malicious payloads.', category='Network Security'),
            Defense(name='Intrusion Detection System (IDS)', description='Monitor network traffic for suspicious activities and alert.', category='Network Security'),
            Defense(name='Account Lockout Policy', description='Lock accounts after repeated failed login attempts to deter brute force.', category='Access Control'),
            Defense(name='Patch Management', description='Regularly apply security patches to close known vulnerabilities.', category='System Security'),
            Defense(name='Network Segmentation', description='Divide the network into segments to limit lateral movement.', category='Network Security'),
            Defense(name='Security Logging & Monitoring', description='Record and analyze security events for detection and forensics.', category='Monitoring'),
            Defense(name='Host Isolation & Containment', description='Isolate compromised hosts to prevent further spread.', category='Incident Response'),
            Defense(name='Secure Session Management', description='Use secure cookies and proper session lifecycle to prevent hijacking.', category='Web Security'),
            Defense(name='Principle of Least Privilege', description='Grant only the minimum permissions required for each role.', category='Access Control'),
        ]

        tools = [
            Tool(name='Nmap', description='A free and open-source network scanner.', version='7.92', path='/usr/bin/nmap'),
            Tool(name='Wireshark', description='A free and open-source packet analyzer.', version='3.6.5', path='C:\\Program Files\\Wireshark\\Wireshark.exe'),
            Tool(name='Metasploit Framework', description='A popular penetration testing framework.', version='6.2.0', path='/opt/metasploit-framework/bin/msfconsole'),
            Tool(name='Burp Suite', description='An integrated platform for web security testing.', version='2023.10', path='/opt/BurpSuite'),
            Tool(name='SQLMap', description='Automated tool for SQL injection detection and exploitation.', version='1.7.2', path='/usr/bin/sqlmap'),
            Tool(name='Hydra', description='Parallelized network login cracker supporting many protocols.', version='9.5', path='/usr/bin/hydra'),
            Tool(name='John the Ripper', description='A fast password cracker.', version='1.9.0', path='/usr/bin/john'),
            Tool(name='Dirb / Gobuster', description='Web content scanner to discover hidden directories and files.', version='2.22', path='/usr/bin/gobuster'),
        ]

        vulnerabilities = [
            Vulnerability(name='Log4Shell', description='A remote code execution vulnerability in Apache Log4j 2.', cve_id='CVE-2021-44228', severity='Critical'),
            Vulnerability(name='Heartbleed', description='A security bug in the OpenSSL cryptography library.', cve_id='CVE-2014-0160', severity='High'),
            Vulnerability(name='Shellshock', description='A family of security bugs in the Unix Bash shell.', cve_id='CVE-2014-6271', severity='Critical'),
            Vulnerability(name='EternalBlue', description='Remote code execution vulnerability in SMBv1 (WannaCry vector).', cve_id='CVE-2017-0144', severity='Critical'),
            Vulnerability(name='BlueKeep', description='Remote desktop services remote code execution vulnerability.', cve_id='CVE-2019-0708', severity='Critical'),
            Vulnerability(name='Apache Path Traversal', description='Path traversal and remote code execution in Apache HTTP Server.', cve_id='CVE-2021-41773', severity='Critical'),
            Vulnerability(name='Log4j RCE (JNDI)', description='JNDI-based remote code execution in Log4j 2.14.1.', cve_id='CVE-2021-44228', severity='Critical'),
            Vulnerability(name='Tomcat JSP Upload', description='Unauthorized JSP upload leads to remote code execution in Apache Tomcat.', cve_id='CVE-2017-12615', severity='Critical'),
            Vulnerability(name='SSH Weak Credentials', description='SSH service with weak or default credentials vulnerable to brute force.', cve_id='CVE-2020-10543', severity='High'),
            Vulnerability(name='PHPUnit RCE', description='Remote code execution via PHPUnit before 5.6.3.', cve_id='CVE-2017-9841', severity='High'),
            Vulnerability(name='Struts2 RCE', description='Remote code execution in Apache Struts2 via OGNL injection.', cve_id='CVE-2017-5638', severity='Critical'),
            Vulnerability(name='Elasticsearch RCE', description='Remote code execution in Elasticsearch via scripting engine.', cve_id='CVE-2015-1427', severity='High'),
        ]

        db.session.bulk_save_objects(attacks)
        db.session.bulk_save_objects(defenses)
        db.session.bulk_save_objects(tools)
        db.session.bulk_save_objects(vulnerabilities)

        db.session.commit()
        print('Database seeded!')

if __name__ == '__main__':
    seed_data()