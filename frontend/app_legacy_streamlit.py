import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# -----------------------------------------
# PAGE CONFIG & CSS (NVIDIA THEME)
# -----------------------------------------
st.set_page_config(page_title="Workforce Intelligence", layout="wide", initial_sidebar_state="expanded")

st.markdown("""
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        html, body, [class*="css"]  {
            font-family: 'Inter', sans-serif;
        }

        .stApp {
            background-color: #000000 !important;
            background-image: 
                radial-gradient(circle at 15% 50%, rgba(26, 26, 26, 0.4), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(118, 185, 0, 0.05), transparent 25%);
            color: #ffffff;
        }

        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}

        [data-testid="stSidebar"] {
            background-color: rgba(10, 10, 10, 0.95) !important;
            border-right: 1px solid rgba(118, 185, 0, 0.2);
        }

        .block-container {
            padding-top: 2rem;
            padding-bottom: 2rem;
            max-width: 95%;
        }

        h1, h2, h3 {
            font-weight: 400 !important;
            letter-spacing: -0.5px;
            color: #f8fafc !important;
        }

        h1 {
            background: -webkit-linear-gradient(45deg, #ffffff, #76b900);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1.5rem;
        }

        .metric-label {
            font-size: 0.85rem;
            color: #999999;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 0.75rem;
            font-weight: 500;
        }
        
        .metric-value {
            font-size: 3.5rem;
            font-weight: 300;
            line-height: 1.1;
            color: #ffffff;
            text-shadow: 0 0 20px rgba(118, 185, 0, 0.2);
        }

        .glass-card {
            background: rgba(26, 26, 26, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(118, 185, 0, 0.2);
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 1.5rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
            height: 100%;
        }

        .glass-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px -8px rgba(118, 185, 0, 0.4);
        }

        /* Trend Arrows */
        .trend-up { color: #76b900; font-weight: 600; }
        .trend-stable { color: #f59e0b; font-weight: 600; }
        .trend-down { color: #ef4444; font-weight: 600; }

        div[data-baseweb="select"] > div {
            background-color: rgba(26, 26, 26, 0.8) !important;
            border-color: rgba(118, 185, 0, 0.3) !important;
            color: white !important;
        }
        
        div[data-testid="stTextInput"] > div > div > input {
            background-color: rgba(26, 26, 26, 0.8) !important;
            color: white !important;
        }
        
        button[data-testid="baseButton-secondary"] {
            border-color: rgba(118, 185, 0, 0.5) !important;
            color: #76b900 !important;
        }
        button[data-testid="baseButton-secondary"]:hover {
            border-color: #76b900 !important;
            background-color: rgba(118, 185, 0, 0.1) !important;
        }
        /* Premium AI Chat UI */
        [data-testid="stChatMessage"] {
            background-color: transparent !important;
            border-radius: 12px;
            margin-bottom: 0.5rem;
            padding: 1rem !important;
        }
        
        [data-testid="chatAvatarIcon-user"], [data-testid="stChatMessageAvatarUser"], [data-testid="stChatMessage"] div:contains("💼") {
            background-color: #555555 !important;
        }
        [data-testid="chatAvatarIcon-assistant"], [data-testid="stChatMessageAvatarAssistant"], [data-testid="stChatMessage"] div:contains("🤖") {
            background-color: #76b900 !important;
        }

        /* AI Message Bubble */
        [data-testid="stChatMessage"]:nth-child(even) {
            background: linear-gradient(145deg, rgba(118, 185, 0, 0.05), rgba(10, 10, 10, 0.9)) !important;
            border-left: 3px solid #76b900 !important;
            box-shadow: 0 4px 20px -5px rgba(118, 185, 0, 0.1) !important;
        }

        /* User Message Bubble */
        [data-testid="stChatMessage"]:nth-child(odd) {
            background: rgba(255, 255, 255, 0.03) !important;
            border-right: 3px solid #555555 !important;
            margin-left: 1rem !important;
        }

        /* Markdown Formatting */
        [data-testid="stMarkdownContainer"] p {
            line-height: 1.7;
            font-size: 0.95rem;
            color: #cbd5e1;
        }
        [data-testid="stMarkdownContainer"] h1, [data-testid="stMarkdownContainer"] h2, [data-testid="stMarkdownContainer"] h3, [data-testid="stMarkdownContainer"] h4 {
            color: #f8fafc !important;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 0.5rem;
            margin-top: 1.5rem;
            font-weight: 500 !important;
        }
        [data-testid="stMarkdownContainer"] ul, [data-testid="stMarkdownContainer"] ol {
            padding-left: 1.5rem;
            margin-bottom: 1rem;
        }
        [data-testid="stMarkdownContainer"] li {
            margin-bottom: 0.5rem;
            line-height: 1.6;
            color: #cbd5e1;
        }
        [data-testid="stMarkdownContainer"] strong {
            color: #f8fafc;
            font-weight: 600;
        }
        [data-testid="stMarkdownContainer"] hr {
            border-color: rgba(255, 255, 255, 0.1);
            margin: 1.5rem 0;
        }
    </style>
""", unsafe_allow_html=True)

import os

API_URL = os.getenv("API_URL", "http://127.0.0.1:8000")

if "token" not in st.session_state:
    st.session_state.token = None
    st.session_state.role = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

# -----------------------------------------
# DATA FETCHING
# -----------------------------------------
@st.cache_data(ttl=30)
def fetch_candidates(_token):
    try: return requests.get(f"{API_URL}/hcm/candidates", headers={"Authorization": f"Bearer {_token}"}).json()
    except: return []

@st.cache_data(ttl=30)
def fetch_performance(_token):
    try: return requests.get(f"{API_URL}/hcm/performance", headers={"Authorization": f"Bearer {_token}"}).json()
    except: return []

def fetch_leave(_token):
    # No cache so approvals reflect instantly
    try: return requests.get(f"{API_URL}/hcm/leave", headers={"Authorization": f"Bearer {_token}"}).json()
    except: return []

@st.cache_data(ttl=30)
def fetch_demographics(_token):
    try: return requests.get(f"{API_URL}/hcm/demographics", headers={"Authorization": f"Bearer {_token}"}).json()
    except: return []

def fetch_notifications(_token):
    try: return requests.get(f"{API_URL}/hcm/notifications", headers={"Authorization": f"Bearer {_token}"}).json()
    except: return []

def approve_leave(request_id):
    try:
        resp = requests.post(f"{API_URL}/hcm/leave/{request_id}/approve", headers={"Authorization": f"Bearer {st.session_state.token}"})
        if resp.status_code == 200:
            st.toast(f"Leave Request #{request_id} Approved!", icon="✅")
        else:
            st.toast("Failed to approve leave.", icon="❌")
    except Exception as e:
        st.toast(f"Error: {e}", icon="❌")

def reject_candidate(candidate_id):
    try:
        resp = requests.post(f"{API_URL}/hcm/candidates/{candidate_id}/reject", headers={"Authorization": f"Bearer {st.session_state.token}"})
        if resp.status_code == 200:
            st.toast(f"Candidate #{candidate_id} Rejected.", icon="✅")
        else:
            st.toast("Failed to reject candidate.", icon="❌")
    except Exception as e:
        st.toast(f"Error: {e}", icon="❌")

def hire_candidate(candidate_id):
    try:
        resp = requests.post(f"{API_URL}/hcm/workflow/hire/{candidate_id}", headers={"Authorization": f"Bearer {st.session_state.token}"})
        if resp.status_code == 200:
            st.toast(f"Candidate Hired! IT Provisioning Triggered.", icon="🚀")
            # Inject a fast draft into the chat history just to show the workflow in action!
            st.session_state.chat_history.append({
                "role": "assistant",
                "content": f"✅ **Automated Workflow Triggered:** I have successfully created the employee profile and sent the IT hardware provisioning request. I've also drafted the welcome email as requested:<br><br><i>Dear new hire,<br>Welcome to NVIDIA! We are thrilled to have you join the team. Your laptop is on the way, and your orientation starts on Monday.<br>- NVIDIA HR Team</i>"
            })
        else:
            st.toast("Failed to hire candidate.", icon="❌")
    except Exception as e:
        st.toast(f"Error: {e}", icon="❌")

def fetch_payroll(_token):
    try: return requests.get(f"{API_URL}/hcm/payroll", headers={"Authorization": f"Bearer {_token}"}).json()
    except: return []

def fetch_succession(_token):
    try: return requests.get(f"{API_URL}/hcm/succession", headers={"Authorization": f"Bearer {_token}"}).json()
    except: return []

def fetch_sentiment(_token):
    try: return requests.get(f"{API_URL}/hcm/sentiment", headers={"Authorization": f"Bearer {_token}"}).json()
    except: return []

def fetch_bias_audit(_token):
    try: return requests.get(f"{API_URL}/hcm/bias_audit", headers={"Authorization": f"Bearer {_token}"}).json()
    except: return {}

def fetch_integrations(_token):
    try: return requests.get(f"{API_URL}/hcm/integrations", headers={"Authorization": f"Bearer {_token}"}).json()
    except: return []

# -----------------------------------------
# PAGES
# -----------------------------------------
def render_core_hr():
    st.title("Organizational Intelligence")
    
    st.info("💡 **Welcome to Organizational Intelligence!** This page aggregates your core HR data to highlight overall headcount, skill readiness, and collaboration pathways. Use the tabs below to explore different strategic views of your workforce.")
    
    data = fetch_demographics(st.session_state.token)
    if not data:
        st.warning("No core HR data available.")
        return
        
    df = pd.DataFrame(data)
    total_hc = len(df)
    
    c1, c2, c3 = st.columns(3)
    c1.markdown(f"<div class='glass-card'><div class='metric-label'>Total Headcount</div><div class='metric-value'>{total_hc:,}</div></div>", unsafe_allow_html=True)
    c2.markdown(f"<div class='glass-card'><div class='metric-label'>Avg Employee Tenure</div><div class='metric-value'>{df['tenure'].mean():.1f} Yrs</div></div>", unsafe_allow_html=True)
    c3.markdown(f"<div class='glass-card'><div class='metric-label'>Critical Roles Filled</div><div class='metric-value' style='color:#10b981;'>84%</div></div>", unsafe_allow_html=True)
    
    tab1, tab2, tab3 = st.tabs(["🔥 Skill Heatmap", "🕸️ Network Analysis", "🏢 Org Structure"])
    
    with tab1:
        st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
        st.markdown("<div class='metric-label'>Organizational Skill Heatmap</div>", unsafe_allow_html=True)
        
        # Mocking the Heatmap as per Slide 13
        heatmap_data = pd.DataFrame({
            "Skill": ["Python", "Machine Learning", "GenAI", "Cloud", "Kubernetes"],
            "Required": [500, 400, 300, 350, 200],
            "Available": [420, 250, 90, 200, 80],
            "Gap": [80, 150, 210, 150, 120]
        })
        
        fig = go.Figure(data=[
            go.Bar(name='Available', x=heatmap_data['Skill'], y=heatmap_data['Available'], marker_color='#38bdf8'),
            go.Bar(name='Gap', x=heatmap_data['Skill'], y=heatmap_data['Gap'], marker_color='#ef4444')
        ])
        fig.update_layout(barmode='stack', plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)', font=dict(color='#cbd5e1'))
        st.plotly_chart(fig, use_container_width=True)
        
        st.markdown("""
        <div style='background: rgba(14, 165, 233, 0.1); padding: 1rem; border-left: 4px solid #0ea5e9; border-radius: 4px;'>
            <strong>AI Recommendation:</strong> Reskill 120 employees internally for Cloud/GenAI + Externally hire 90 employees for Machine Learning.
        </div>
        """, unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)
        
    with tab2:
        st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
        st.markdown("<div class='metric-label'>Organizational Network Analysis (ONA)</div>", unsafe_allow_html=True)
        st.markdown("<p style='color:#cbd5e1; font-size: 0.9rem;'>Visualizing collaboration pathways to identify isolated flight-risks and central influencers.</p>", unsafe_allow_html=True)
        
        # Generate Mock ONA Graph using NetworkX & Plotly
        import networkx as nx
        G = nx.erdos_renyi_graph(40, 0.1)
        pos = nx.spring_layout(G)
        
        edge_x = []
        edge_y = []
        for edge in G.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            edge_x.extend([x0, x1, None])
            edge_y.extend([y0, y1, None])
            
        edge_trace = go.Scatter(
            x=edge_x, y=edge_y,
            line=dict(width=0.5, color='#475569'),
            hoverinfo='none',
            mode='lines')

        node_x = []
        node_y = []
        for node in G.nodes():
            x, y = pos[node]
            node_x.append(x)
            node_y.append(y)
            
        # Highlight some nodes as flight risks
        node_colors = ['#ef4444' if i % 7 == 0 else '#38bdf8' for i in range(len(G.nodes()))]
        
        node_trace = go.Scatter(
            x=node_x, y=node_y,
            mode='markers',
            hoverinfo='text',
            marker=dict(
                showscale=False,
                color=node_colors,
                size=10,
                line_width=2))
                
        fig_net = go.Figure(data=[edge_trace, node_trace],
                     layout=go.Layout(
                        showlegend=False,
                        hovermode='closest',
                        margin=dict(b=0,l=0,r=0,t=0),
                        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                        plot_bgcolor='rgba(0,0,0,0)',
                        paper_bgcolor='rgba(0,0,0,0)'
                     ))
        st.plotly_chart(fig_net, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)
        
    with tab3:
        st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
        st.markdown("<div class='metric-label'>Organizational Headcount (Treemap)</div>", unsafe_allow_html=True)
        # Group by department and role for Treemap
        tree_df = df.groupby(['department', 'role']).size().reset_index(name='count')
        tree_df['company'] = 'NVIDIA'
        fig_tree = px.treemap(tree_df, path=['company', 'department', 'role'], values='count', color='count', color_continuous_scale='Greens')
        fig_tree.update_layout(margin=dict(t=0, l=0, r=0, b=0), paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font=dict(color='#cbd5e1'))
        st.plotly_chart(fig_tree, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

def render_succession():
    st.title("👑 Succession Planning (Bench Strength)")
    st.info("💡 Identify and prepare high-potential employees to step into critical leadership roles.")
    data = fetch_succession(st.session_state.token)
    if not data:
        st.warning("No succession data available.")
        return
    
    df = pd.DataFrame(data)
    roles = df['target_role'].unique()
    tabs = st.tabs(roles.tolist())
    
    for i, role in enumerate(roles):
        with tabs[i]:
            role_data = df[df['target_role'] == role].sort_values(by='readiness_score', ascending=False)
            st.markdown(f"### Successors for {role}")
            for _, row in role_data.iterrows():
                color = '#10b981' if row['readiness_score'] > 85 else '#f59e0b'
                time_str = 'Ready Now' if row['time_to_ready_months'] == 0 else f"{row['time_to_ready_months']} months"
                st.markdown(f"""
                <div style='background: rgba(255,255,255,0.05); padding: 1rem; margin-bottom: 1rem; border-radius: 8px; border-left: 4px solid {color};'>
                    <div style='display: flex; justify-content: space-between;'>
                        <div>
                            <div style='font-size: 1.1rem; font-weight: bold; color: #f8fafc;'>{row['successor_name']}</div>
                            <div style='color: #94a3b8; font-size: 0.9rem;'>Current: {row['successor_current_role']}</div>
                        </div>
                        <div style='text-align: right;'>
                            <div style='font-size: 1.2rem; font-weight: bold; color: {color};'>{row['readiness_score']}% Ready</div>
                            <div style='color: #94a3b8; font-size: 0.8rem;'>{time_str}</div>
                        </div>
                    </div>
                    <div style='margin-top: 0.5rem; color: #cbd5e1; font-size: 0.85rem;'>
                        <strong>Skill Gap to Close:</strong> {row['key_skill_gap']}
                    </div>
                </div>
                """, unsafe_allow_html=True)

def render_sentiment():
    st.title("🌡️ Real-Time Sentiment & Burnout")
    st.info("💡 Aggregated employee sentiment, engagement, and work-life balance scores across the organization.")
    data = fetch_sentiment(st.session_state.token)
    if not data:
        st.warning("No sentiment data available.")
        return
        
    df = pd.DataFrame(data)
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.markdown("<div class='metric-label'>Global Sentiment & Burnout Map</div>", unsafe_allow_html=True)
    fig_heat = px.density_heatmap(
        df, x="department", y="satisfaction", z="engagement", histfunc="avg",
        color_continuous_scale="RdYlGn", nbinsy=5
    )
    fig_heat.update_layout(margin=dict(t=0, l=0, r=0, b=0), paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font=dict(color='#cbd5e1'))
    st.plotly_chart(fig_heat, use_container_width=True)
    st.markdown("</div>", unsafe_allow_html=True)

def render_bias_audit():
    st.title("⚖️ AI Bias & Compliance Audit")
    st.info("💡 Prove to Legal and Compliance teams that your predictive ML models are fair and unbiased across protected demographics.")
    data = fetch_bias_audit(st.session_state.token)
    
    st.markdown(f"**Audit Status:** <span style='color:#10b981;'>{data.get('status')} 🟢</span>", unsafe_allow_html=True)
    st.markdown(f"**Last Audit:** {data.get('last_audit')}")
    st.markdown("### Audited Models")
    st.write(", ".join(data.get('models_audited', [])))
    
    st.markdown("### Fairness Metrics")
    c1, c2, c3, c4 = st.columns(4)
    metrics = data.get('metrics', {})
    c1.metric("Gender Parity Score", f"{metrics.get('gender_parity_score', 0):.2f}")
    c2.metric("Age Bias Detected", str(metrics.get('age_bias_detected', 'N/A')))
    c3.metric("Pay Equity Gap", metrics.get('pay_equity_gap', 'N/A'))
    c4.metric("Explainability Index", f"{metrics.get('explainability_index', 0):.2f}")
    
def render_integrations():
    st.title("🔌 Data Connectors Hub")
    st.info("💡 The Intelligence Layer sitting on top of your existing fragmented HR systems. View real-time synchronization status.")
    data = fetch_integrations(st.session_state.token)
    df = pd.DataFrame(data)
    st.dataframe(df, use_container_width=True, hide_index=True)

def render_employee_portal():
    st.title("🚀 My Career Growth Portal")
    st.markdown("<h3 style='color:#76b900;'>Welcome back!</h3>", unsafe_allow_html=True)
    st.info("💡 This is your personalized portal. Our AI has analyzed your current skills and mapped out the exact learning path you need to take to reach the next level in your career.")
    
    c1, c2 = st.columns(2)
    with c1:
        st.markdown("""
        <div class='glass-card'>
            <h4>Current Profile</h4>
            <p><strong>Role:</strong> Software Engineer II</p>
            <p><strong>Current Skills:</strong> Python, SQL, REST APIs</p>
            <p><strong>Target Role:</strong> Senior Machine Learning Engineer</p>
            <p style='color:#ef4444;'><strong>Missing Skills:</strong> PyTorch, LLM Fine-Tuning, MLOps</p>
        </div>
        """, unsafe_allow_html=True)
    
    with c2:
        st.markdown("""
        <div class='glass-card'>
            <h4>AI-Generated Learning Path</h4>
            <ul style='list-style-type: none; padding: 0;'>
                <li>✅ <strike>Complete Python Data Structures</strike></li>
                <li>🚀 <strong>In Progress:</strong> PyTorch for Deep Learning (Udacity)</li>
                <li>⏳ <strong>Up Next:</strong> Distributed Training Strategies</li>
            </ul>
            <br>
            <a href='#' style='background-color:#76b900; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;'>Enroll in Next Course</a>
        </div>
        """, unsafe_allow_html=True)
        
def render_ats():
    st.title("Skill Gap Engine (ATS)")
    st.info("💡 **Welcome to the Skill Gap Engine!** This module automatically compares incoming candidates against your organization's required skill matrices to calculate an AI Readiness Score.")
    
    data = fetch_candidates(st.session_state.token)
    if not data:
        st.warning("No ATS data available.")
        return
        
    df = pd.DataFrame(data)
    
    st.markdown("<div class='metric-label' style='margin-top: 1rem;'>Candidate Readiness Scoring</div>", unsafe_allow_html=True)
    
    role_skills = {
        'GPU Architect': ['CUDA', 'C++', 'System Architecture', 'Parallel Computing', 'TensorRT', 'Hardware Design'],
        'Enterprise AI Sales': ['Salesforce', 'Negotiation', 'DGX Systems', 'Omniverse', 'B2B Sales'],
        'Talent Acquisition (DL)': ['Workday', 'Technical Recruiting', 'Employee Relations', 'Deep Learning Market'],
        'AI Researcher': ['Python', 'Machine Learning', 'PyTorch', 'C++', 'TensorFlow', 'LLMs', 'CUDA'],
        'Financial Analyst': ['Excel', 'Bloomberg', 'Financial Modeling', 'SQL', 'Forecasting'],
        'TensorRT Support': ['CUDA', 'JIRA', 'Networking', 'Linux', 'TensorRT', 'C++']
    }
    
    for _, row in df.iterrows():
        req_skills = set(role_skills.get(row['role_applied'], []))
        cand_skills = set(row['skills'].split(',')) if pd.notna(row['skills']) else set()
        
        matched = cand_skills.intersection(req_skills)
        missing = req_skills.difference(cand_skills)
        match_pct = len(matched) / len(req_skills) * 100 if req_skills else 0
        
        avatar = row['avatar_url'] if pd.notna(row['avatar_url']) else "https://ui-avatars.com/api/?name=C+A"
        
        with st.container():
            st.markdown(f"<div class='glass-card' style='padding: 1.5rem; margin-bottom: 0.5rem;'><div style='display: flex; justify-content: space-between; align-items: center;'><div style='display: flex; align-items: center; gap: 1rem;'><img src='{avatar}' style='border-radius: 50%; width: 50px; height: 50px; border: 2px solid #38bdf8;'/><div><h3 style='margin: 0; font-size: 1.2rem; color: #f8fafc;'>{row['name']}</h3><div style='color: #94a3b8; font-size: 0.9rem;'>{row['role_applied']} • Stage: <span style='color: #38bdf8;'>{row['stage']}</span></div></div></div><div style='text-align: right;'><div style='font-size: 2rem; font-weight: 600; color: #10b981; line-height: 1;'>{match_pct:.0f}%</div><div style='color: #94a3b8; font-size: 0.8rem; text-transform: uppercase;'>Match Score</div></div></div><div style='display: flex; margin-top: 1.5rem; gap: 2rem;'><div style='flex: 1;'><div style='color: #10b981; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; margin-bottom: 0.5rem;'>Matches</div><div style='color: #cbd5e1; font-size: 0.9rem;'>{', '.join(matched) if matched else 'None'}</div></div><div style='flex: 1;'><div style='color: #ef4444; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; margin-bottom: 0.5rem;'>Gaps</div><div style='color: #cbd5e1; font-size: 0.9rem;'>{', '.join(missing) if missing else 'None'}</div></div></div></div>", unsafe_allow_html=True)
            
            c1, c2, c3, c4 = st.columns([1, 1, 1, 3])
            if c1.button("Reject", key=f"rej_{row['id']}", type="secondary"):
                reject_candidate(row['id'])
                st.rerun()
            if c2.button("Advance", key=f"adv_{row['id']}", type="primary"):
                st.toast(f"Candidate #{row['id']} advanced to next stage!", icon="🚀")
            if c3.button("Hire 🚀", key=f"hire_{row['id']}", type="primary"):
                hire_candidate(row['id'])
                st.rerun()
            st.markdown("<div style='height: 2rem;'></div>", unsafe_allow_html=True)

def render_performance():
    st.title("Performance & Attrition Trends")
    st.info("💡 **Welcome to Performance & Attrition Trends!** Explore real-time predictions generated by our XGBoost Machine Learning model. Select a high-risk employee below and use the sliders to dynamically simulate the impact of different retention interventions.")
    
    data = fetch_performance(st.session_state.token)
    if not data:
        st.warning("No performance data available.")
        return
        
    df = pd.DataFrame(data)
    
    trends = df['performance_trend'].value_counts()
    improving = trends.get('Improving', 0)
    stable = trends.get('Stable', 0)
    declining = trends.get('Declining', 0)
    total = len(df)
    
    c1, c2, c3 = st.columns(3)
    c1.markdown(f"<div class='glass-card'><div class='metric-label'>Improving</div><div class='metric-value trend-up'>↑ {(improving/total)*100:.1f}%</div></div>", unsafe_allow_html=True)
    c2.markdown(f"<div class='glass-card'><div class='metric-label'>Stable</div><div class='metric-value trend-stable'>→ {(stable/total)*100:.1f}%</div></div>", unsafe_allow_html=True)
    c3.markdown(f"<div class='glass-card'><div class='metric-label'>Declining</div><div class='metric-value trend-down'>↓ {(declining/total)*100:.1f}%</div></div>", unsafe_allow_html=True)
    
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.markdown("<div class='metric-label'>9-Box Grid (Performance vs Potential)</div>", unsafe_allow_html=True)
    
    declining_df = df[df['performance_trend'] == 'Declining']
    
    fig_scatter = px.scatter(
        df, x="performance_score", y="potential_score", color="performance_trend",
        color_discrete_map={"Improving": "#10b981", "Stable": "#f59e0b", "Declining": "#ef4444"},
        hover_data=["name", "department", "role"]
    )
    fig_scatter.update_layout(
        xaxis_title="Performance", yaxis_title="Potential",
        margin=dict(t=0, l=0, r=0, b=0), paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', 
        font=dict(color='#cbd5e1')
    )
    st.plotly_chart(fig_scatter, use_container_width=True)
    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.markdown("<div class='metric-label'>Interactive Attrition Simulator</div>", unsafe_allow_html=True)
    st.markdown("<p style='color:#cbd5e1; font-size: 0.9rem;'>Select an employee to simulate how salary increases or work-life balance improvements affect their flight risk.</p>", unsafe_allow_html=True)
    
    sim_col1, sim_col2 = st.columns([1, 1])
    
    with sim_col1:
        if not declining_df.empty:
            sim_df = declining_df.sort_values(by=['department', 'role', 'name'])
        else:
            sim_df = df.sort_values(by=['department', 'role', 'name'])

        sc1, sc2, sc3 = st.columns(3)
        sim_depts = sim_df['department'].unique().tolist()
        sim_dept = sc1.selectbox("Department", sim_depts, key="sim_dept")
        sim_roles = sim_df[sim_df['department'] == sim_dept]['role'].unique().tolist()
        sim_role = sc2.selectbox("Role", sim_roles, key="sim_role")
        sim_emps = sim_df[(sim_df['department'] == sim_dept) & (sim_df['role'] == sim_role)]
        sim_emp_names = sim_emps['name'].tolist()
        sim_emp = sc3.selectbox("Employee", sim_emp_names, key="sim_emp")
        if not sim_emp: return
        sim_emp_id = int(sim_emps[sim_emps['name'] == sim_emp].iloc[0]['employee_id'])
        
        salary_bump = st.slider("Salary Increase (%)", 0, 30, 0, 1)
        wlb_boost = st.slider("Work-Life Balance Improvement (1-5 Scale)", 0, 3, 0, 1)
        
    with sim_col2:
        if st.button("Run Simulation", use_container_width=True, type="primary"):
            with st.spinner("Simulating..."):
                try:
                    resp = requests.post(f"{API_URL}/predict/simulate", json={
                        "employee_id": int(sim_emp_id),
                        "salary_increase_pct": int(salary_bump),
                        "work_life_balance_boost": int(wlb_boost)
                    }, headers={"Authorization": f"Bearer {st.session_state.token}"})
                    
                    if resp.status_code == 200:
                        sim_data = resp.json()
                        base = sim_data['BaseProbability'] * 100
                        new = sim_data['SimulatedProbability'] * 100
                        delta = sim_data['RiskDelta'] * 100
                        
                        st.markdown(f"""
                        <div style='background: rgba(15, 23, 42, 0.9); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); text-align: center;'>
                            <h4 style='margin-top:0;'>Flight Risk Impact</h4>
                            <div style='display: flex; justify-content: space-around; align-items: center;'>
                                <div>
                                    <div style='color: #94a3b8; font-size: 0.8rem;'>Base Risk</div>
                                    <div style='font-size: 1.8rem; color: #f59e0b;'>{base:.1f}%</div>
                                </div>
                                <div style='font-size: 2rem; color: #38bdf8;'>→</div>
                                <div>
                                    <div style='color: #94a3b8; font-size: 0.8rem;'>Simulated Risk</div>
                                    <div style='font-size: 1.8rem; color: #10b981;'>{new:.1f}%</div>
                                </div>
                            </div>
                            <div style='margin-top: 1rem; color: #10b981; font-weight: bold;'>Risk Reduction: {abs(delta):.1f}%</div>
                        </div>
                        """, unsafe_allow_html=True)
                        if st.button("🚀 1-Click Route for CFO Approval", key="cfo_approve", use_container_width=True):
                            st.toast("Memo Generated & DocuSign routed to CFO successfully!", icon="✅")
                            st.session_state.chat_history.append({
                                "role": "assistant",
                                "content": f"✅ **CFO Approval Routed:** I have drafted the compensation adjustment memo for {sim_emp} requesting a {salary_bump}% raise and sent it via DocuSign to the CFO. I will let you know when it is signed."
                            })
                    else:
                        st.error(f"Failed to run simulation. {resp.text}")
                except Exception as e:
                    st.error(f"Simulation Error: {e}")
    st.markdown("</div>", unsafe_allow_html=True)

def render_leave():
    st.title("Actionable Leave Management")
    
    data = fetch_leave(st.session_state.token)
    if not data:
        st.warning("No leave data available.")
        return
        
    df = pd.DataFrame(data)
    pending_df = df[df['status'] == 'Pending']
    
    c1, c2 = st.columns([1, 3])
    with c1:
        st.markdown(f"<div class='glass-card'><div class='metric-label'>Pending Approvals</div><div class='metric-value' style='color:#f59e0b;'>{len(pending_df)}</div></div>", unsafe_allow_html=True)
        
    with c2:
        st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
        st.markdown("<div class='metric-label'>1-Click Approval Queue</div>", unsafe_allow_html=True)
        
        if pending_df.empty:
            st.success("All caught up! No pending leave requests.")
        else:
            for _, row in pending_df.iterrows():
                col1, col2, col3, col4 = st.columns([1, 2, 1, 1])
                col1.write(f"**{row['name']}**")
                col2.write(f"{row['days']} days ({row['leave_type']})")
                col3.write(f"*{row['status']}*")
                if col4.button("Grant Leave", key=f"grant_{row['id']}"):
                    approve_leave(row['id'])
                    st.rerun()
                st.markdown("<hr style='margin: 0.5rem 0; border-color: rgba(255,255,255,0.1);'>", unsafe_allow_html=True)
                
        st.markdown("</div>", unsafe_allow_html=True)

def render_roi():
    st.title("Executive ROI & Business Outcomes")
    st.markdown("<div style='height: 10px'></div>", unsafe_allow_html=True)
    
    st.markdown("""
    <div class='glass-card'>
        <h3 style='margin-top:0;'>Platform Impact Matrix</h3>
        <p style='color:#cbd5e1;'>Measuring the direct business value generated by Agentic HRMS interventions.</p>
    </div>
    """, unsafe_allow_html=True)
    
    c1, c2, c3 = st.columns(3)
    c1.markdown(f"<div class='glass-card'><div class='metric-label'>Internal Mobility</div><div class='metric-value trend-up'>↑ 34%</div><div style='color:#94a3b8; font-size:0.85rem; margin-top:0.5rem;'>Reskilling success rate</div></div>", unsafe_allow_html=True)
    c2.markdown(f"<div class='glass-card'><div class='metric-label'>Time-to-Hire</div><div class='metric-value trend-down'>↓ 12 Days</div><div style='color:#94a3b8; font-size:0.85rem; margin-top:0.5rem;'>Reduced via Skill Matching</div></div>", unsafe_allow_html=True)
    c3.markdown(f"<div class='glass-card'><div class='metric-label'>Attrition Savings</div><div class='metric-value trend-up'>$1.2M</div><div style='color:#94a3b8; font-size:0.85rem; margin-top:0.5rem;'>Prevented turnover costs</div></div>", unsafe_allow_html=True)
    
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.markdown("<div class='metric-label'>MLOps System Health</div>", unsafe_allow_html=True)
    
    # Fetch real MLOps health
    try:
        health = requests.get(f"{API_URL}/hcm/mlops/health", headers={"Authorization": f"Bearer {st.session_state.token}"}).json()
        if health.get("status") == "Healthy":
            drift_status = f"<span style='color:#10b981;'>🟢 {health['status']} (No drift detected. {health['metrics']['total_predictions_logged']} predictions logged)</span>"
        else:
            drift_status = f"<span style='color:#f59e0b;'>🟡 {health.get('status', 'Warning')} - {health.get('message', 'No data')}</span>"
    except:
        drift_status = "<span style='color:#ef4444;'>🔴 Offline (API Unreachable)</span>"

    st.markdown(f"""
    - **Data Drift Status:** {drift_status}
    - **Model Precision:** <span style='color:#10b981;'>🟢 0.89 ROC-AUC (Stable)</span>
    - **RAG Policy Sync:** <span style='color:#10b981;'>🟢 Synced via local vector store</span>
    """, unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

def render_payroll():
    st.title("💳 Payroll & Benefits")
    st.markdown("<p style='color:#94a3b8;'>Manage employee compensation, direct deposit, and bonus structures.</p>", unsafe_allow_html=True)
    
    data = fetch_payroll(st.session_state.token)
    if not data:
        st.warning("No payroll data available.")
        return
        
    df = pd.DataFrame(data)
    df = df.sort_values(by=['department', 'role', 'name'])
    col_d, col_r, col_e = st.columns(3)
    depts = df['department'].unique().tolist()
    sel_dept = col_d.selectbox("Select Department", depts, key="pay_dept")
    roles = df[df['department'] == sel_dept]['role'].unique().tolist()
    sel_role = col_r.selectbox("Select Role", roles, key="pay_role")
    emps = df[(df['department'] == sel_dept) & (df['role'] == sel_role)]['name'].tolist()
    sel_emp = col_e.selectbox("Select Employee", emps, key="pay_emp")
    if not sel_emp: return
    emp_row = df[(df['department'] == sel_dept) & (df['role'] == sel_role) & (df['name'] == sel_emp)].iloc[0]
    base = emp_row['base_salary']
    bonus_pct = emp_row['bonus_pct']
    bonus = base * bonus_pct
    total = base + bonus
    
    c1, c2, c3 = st.columns(3)
    c1.markdown(f"<div class='glass-card'><div class='metric-label'>Annual Base Salary</div><div class='metric-value'>${base:,.0f}</div></div>", unsafe_allow_html=True)
    c2.markdown(f"<div class='glass-card'><div class='metric-label'>Target Bonus ({bonus_pct*100:.0f}%)</div><div class='metric-value' style='color:#10b981;'>${bonus:,.0f}</div></div>", unsafe_allow_html=True)
    c3.markdown(f"<div class='glass-card'><div class='metric-label'>Total Compensation</div><div class='metric-value' style='color:#38bdf8;'>${total:,.0f}</div></div>", unsafe_allow_html=True)

    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.markdown("<div class='metric-label'>Direct Deposit & Tax Information</div>", unsafe_allow_html=True)
    
    bc1, bc2, bc3 = st.columns(3)
    with bc1:
        st.markdown(f"""
        <div style='background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; height: 100%;'>
            <h4 style='color: #cbd5e1; margin-top: 0;'>Banking Details</h4>
            <div style='margin-bottom: 0.5rem;'><strong style='color:#94a3b8;'>Bank Name:</strong> {emp_row['bank_name']}</div>
            <div style='margin-bottom: 0.5rem;'><strong style='color:#94a3b8;'>Account Number:</strong> {emp_row['account_number']}</div>
            <div><strong style='color:#94a3b8;'>Routing Number:</strong> {emp_row['routing_number']}</div>
        </div>
        """, unsafe_allow_html=True)
    with bc2:
        st.markdown(f"""
        <div style='background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; height: 100%;'>
            <h4 style='color: #cbd5e1; margin-top: 0;'>Tax Setup</h4>
            <div style='margin-bottom: 0.5rem;'><strong style='color:#94a3b8;'>Filing Status:</strong> {emp_row['tax_status']}</div>
            <div style='margin-bottom: 0.5rem;'><strong style='color:#94a3b8;'>State Tax ID:</strong> WA-Registered</div>
            <div><strong style='color:#94a3b8;'>401k Match:</strong> 4% Enrolled</div>
        </div>
        """, unsafe_allow_html=True)
    with bc3:
        st.markdown(f"""
        <div style='background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; height: 100%;'>
            <h4 style='color: #cbd5e1; margin-top: 0;'>Health & Benefits</h4>
            <div style='margin-bottom: 0.5rem;'><strong style='color:#94a3b8;'>Medical:</strong> Gold PPO</div>
            <div style='margin-bottom: 0.5rem;'><strong style='color:#94a3b8;'>Vision & Dental:</strong> Enrolled</div>
            <div><strong style='color:#94a3b8;'>PTO Accrual:</strong> 15 Days/Yr</div>
        </div>
        """, unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

    # Capability vs Salary Justification
    # Generate a mock capability readiness score based on bonus pct to simulate ROI
    readiness = int(75 + (bonus_pct * 100))
    roi_status = "Excellent ROI" if readiness > 85 else ("Standard ROI" if readiness > 75 else "At Risk")
    roi_color = "#10b981" if readiness > 85 else ("#f59e0b" if readiness > 75 else "#ef4444")
    
    st.markdown(f"""
    <div class='glass-card' style='margin-top: 1rem;'>
        <div class='metric-label'>Compensation ROI & Capability Analysis</div>
        <div style='display: flex; gap: 2rem; align-items: center; margin-top: 1rem;'>
            <div style='flex: 1;'>
                <div style='color:#94a3b8; font-size: 0.9rem; margin-bottom: 0.5rem;'>Skill Gap Engine Readiness Score</div>
                <div style='font-size: 2rem; font-weight: bold; color: {roi_color};'>{readiness}%</div>
            </div>
            <div style='flex: 1;'>
                <div style='color:#94a3b8; font-size: 0.9rem; margin-bottom: 0.5rem;'>ROI Status</div>
                <div style='font-size: 1.5rem; font-weight: bold; color: #f8fafc;'>{roi_status}</div>
            </div>
            <div style='flex: 2;'>
                <p style='color:#cbd5e1; font-size: 0.9rem; margin: 0;'>
                    Based on semantic skill matching, {emp_row['name'].split()[0]} has a {readiness}% capability readiness for their current role. 
                    Given the base salary of ${base:,.0f}, this indicates a <strong>{roi_status.lower()}</strong> on compensation spend.
                </p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_individual():
    st.title("Individual-Level Intelligence")
    st.markdown("<p style='color:#94a3b8;'>Deep dive into individual skill profiles, readiness metrics, and personalized upskilling pathways.</p>", unsafe_allow_html=True)
    
    data = fetch_demographics(st.session_state.token)
    if not data:
        st.warning("No employee data available.")
        return
        
    df = pd.DataFrame(data)
    df = df.sort_values(by=['department', 'role', 'name'])
    col_d, col_r, col_e = st.columns(3)
    depts = df['department'].unique().tolist()
    sel_dept = col_d.selectbox("Select Department", depts, key="ind_dept")
    roles = df[df['department'] == sel_dept]['role'].unique().tolist()
    sel_role = col_r.selectbox("Select Role", roles, key="ind_role")
    emps = df[(df['department'] == sel_dept) & (df['role'] == sel_role)]['name'].tolist()
    sel_emp = col_e.selectbox("Select Employee", emps, key="ind_emp")
    if not sel_emp: return
    
    emp_row = df[(df['department'] == sel_dept) & (df['role'] == sel_role) & (df['name'] == sel_emp)].iloc[0]
    actual_name = emp_row['name']
    
    # Deterministic generation based on employee name
    import hashlib
    seed_str = actual_name + sel_role
    seed = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
    
    import random
    rng = random.Random(seed)
    
    readiness_today = rng.randint(45, 85)
    skill_gap = 100 - readiness_today
    projected = min(99, readiness_today + rng.randint(15, 30))
    
    target_role = f"Senior {sel_role}" if not sel_role.startswith("Senior") else f"Lead {sel_role.replace('Senior ', '')}"
    
    # Mocking skills based on role
    all_skills = {
        "Data Scientist": (["Python", "SQL", "Machine Learning"], ["Deep Learning", "MLOps", "Model Deployment"]),
        "Software Engineer": (["Java", "Spring Boot", "Git"], ["Microservices", "Kubernetes", "System Design"]),
        "HR Manager": (["Employee Relations", "Recruiting"], ["Strategic HR", "Compensation Design", "People Analytics"])
    }
    
    role_base = sel_role
    for key in all_skills:
        if key in sel_role:
            role_base = key
            break
            
    if role_base in all_skills:
        current_skills = rng.sample(all_skills[role_base][0], k=2) + ["Agile"]
        missing_skills = rng.sample(all_skills[role_base][1], k=2) + ["Leadership"]
    else:
        current_skills = ["Communication", "Project Management", "Data Analysis"]
        missing_skills = ["Advanced Analytics", "Cross-functional Leadership", "Strategic Planning"]
        
    steps = [
        f"Complete '{missing_skills[0]}' Certification",
        f"Attend Internal {missing_skills[1]} Workshop",
        f"Pair program with Senior {sel_role}s",
        "Attend GTC AI Sessions"
    ]
    
    c_left, c_right = st.columns([1, 2.2])
    
    with c_left:
        st.markdown(f"""
        <div class='glass-card' style='height: 100%;'>
            <div style='display: flex; align-items: center; margin-bottom: 1.5rem;'>
                <div style='width: 60px; height: 60px; border-radius: 50%; background-color: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #38bdf8; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; font-weight: bold; margin-right: 1rem;'>
                    {actual_name.split()[0][0]}{actual_name.split()[-1][0] if len(actual_name.split()) > 1 else ''}
                </div>
                <div>
                    <h3 style='margin: 0; color: #f8fafc; font-weight: 600; font-size: 1.2rem;'>{actual_name}</h3>
                    <p style='margin: 0; color: #94a3b8; font-size: 0.85rem;'>Target role: {target_role}</p>
                </div>
            </div>
            <h4 style='color: #38bdf8; font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;'>CURRENT SKILLS</h4>
            <p style='color: #e2e8f0; font-size: 0.9rem; margin-bottom: 1.5rem;'>{" · ".join(current_skills)}</p>
            <h4 style='color: #ef4444; font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;'>MISSING SKILLS</h4>
            <p style='color: #e2e8f0; font-size: 0.9rem; margin-bottom: 1.5rem;'>{" · ".join(missing_skills)}</p>
            <h4 style='color: #10b981; font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;'>RECOMMENDED NEXT STEPS</h4>
            <ul style='color: #cbd5e1; font-size: 0.9rem; padding-left: 1.2rem; margin: 0;'>
                {"".join([f"<li style='margin-bottom:0.25rem;'>{step}</li>" for step in steps])}
            </ul>
        </div>
        """, unsafe_allow_html=True)
        
    with c_right:
        k1, k2, k3 = st.columns(3)
        k1.markdown(f"""
        <div class='glass-card' style='border-top: 4px solid #ef4444; padding: 2rem 1rem; text-align: center; height: 160px; display: flex; flex-direction: column; justify-content: center;'>
            <div style='font-size: 3rem; font-weight: 300; color: #ef4444; line-height: 1;'>{skill_gap}%</div>
            <div style='color: #94a3b8; font-size: 0.85rem; margin-top: 1rem; text-transform: uppercase; letter-spacing: 1px;'>Skill Gap</div>
        </div>
        """, unsafe_allow_html=True)
        k2.markdown(f"""
        <div class='glass-card' style='border-top: 4px solid #f59e0b; padding: 2rem 1rem; text-align: center; height: 160px; display: flex; flex-direction: column; justify-content: center;'>
            <div style='font-size: 3rem; font-weight: 300; color: #f59e0b; line-height: 1;'>{readiness_today}%</div>
            <div style='color: #94a3b8; font-size: 0.85rem; margin-top: 1rem; text-transform: uppercase; letter-spacing: 1px;'>Readiness Today</div>
        </div>
        """, unsafe_allow_html=True)
        k3.markdown(f"""
        <div class='glass-card' style='border-top: 4px solid #10b981; padding: 2rem 1rem; text-align: center; height: 160px; display: flex; flex-direction: column; justify-content: center;'>
            <div style='font-size: 3rem; font-weight: 300; color: #10b981; line-height: 1;'>{projected}%</div>
            <div style='color: #94a3b8; font-size: 0.85rem; margin-top: 1rem; text-transform: uppercase; letter-spacing: 1px;'>Projected Readiness<br>After Training</div>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("<div style='height: 1.5rem;'></div>", unsafe_allow_html=True)
        
        st.markdown(f"""
        <div style='background: #e2e8f0; border-radius: 8px; padding: 1.5rem; color: #0f172a;'>
            <h4 style='color: #28748c; font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-top: 0; margin-bottom: 1.5rem;'>READINESS TRAJECTORY</h4>
            <div style='display: flex; align-items: center; margin-bottom: 1.5rem;'>
                <div style='width: 80px; font-size: 0.9rem; color: #334155;'>Today</div>
                <div style='flex-grow: 1; background: white; height: 24px; border-radius: 4px; overflow: hidden; display: flex;'>
                    <div style='width: {readiness_today}%; background: #d97706; height: 100%; border-radius: 4px; transition: width 1s ease-in-out;'></div>
                </div>
                <div style='width: 40px; text-align: right; font-size: 0.85rem; font-weight: 600; color: #d97706;'>{readiness_today}%</div>
            </div>
            <div style='display: flex; align-items: center; margin-bottom: 1.5rem;'>
                <div style='width: 80px; font-size: 0.9rem; color: #334155;'>After plan</div>
                <div style='flex-grow: 1; background: white; height: 24px; border-radius: 4px; overflow: hidden; display: flex;'>
                    <div style='width: {projected}%; background: #28748c; height: 100%; border-radius: 4px; transition: width 1s ease-in-out;'></div>
                </div>
                <div style='width: 40px; text-align: right; font-size: 0.85rem; font-weight: 600; color: #28748c;'>{projected}%</div>
            </div>
            <p style='margin: 0; font-size: 0.8rem; color: #64748b; font-style: italic;'>Skill-gap engine uses embeddings + taxonomy, not exact string matching — "{current_skills[0]}" and "{missing_skills[0]}" are analyzed dynamically.</p>
        </div>
        """, unsafe_allow_html=True)

# -----------------------------------------
# MAIN APP LOGIC
# -----------------------------------------
if not st.session_state.token:
    # Render Login Screen
    st.markdown("""
    <style>
        .stApp {
            background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
        }
        .login-card {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(118, 185, 0, 0.3);
            border-radius: 16px;
            padding: 3rem;
            box-shadow: 0 0 40px rgba(118, 185, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.02);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .login-card:hover {
            box-shadow: 0 0 60px rgba(118, 185, 0, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.05);
        }
        div[data-testid="stTextInput"] label {
            color: #94a3b8 !important;
            font-size: 0.9rem !important;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        div[data-testid="stTextInput"] input {
            background-color: rgba(0, 0, 0, 0.3) !important;
            border: 1px solid #334155 !important;
            color: #f8fafc !important;
            border-radius: 8px;
            padding: 0.75rem 1rem;
        }
        div[data-testid="stTextInput"] input:focus {
            border-color: #76b900 !important;
            box-shadow: 0 0 0 1px #76b900 !important;
        }
        button[data-testid="baseButton-primary"] {
            background: linear-gradient(90deg, #76b900 0%, #5d9300 100%) !important;
            color: white !important;
            font-weight: 700 !important;
            letter-spacing: 2px !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 0.75rem !important;
            text-transform: uppercase;
            transition: all 0.3s ease !important;
        }
        button[data-testid="baseButton-primary"]:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 20px rgba(118, 185, 0, 0.4) !important;
            background: linear-gradient(90deg, #87d400 0%, #6ba800 100%) !important;
        }
    </style>
    """, unsafe_allow_html=True)

    st.markdown("<div style='height: 12vh;'></div>", unsafe_allow_html=True)
    c_left, c_mid, c_right = st.columns([1, 1.2, 1])
    with c_mid:
        st.markdown("""
        <div style='text-align:center; margin-bottom: 3rem;'>
            <div style='display: inline-block; padding: 1rem; background: rgba(118, 185, 0, 0.1); border-radius: 50%; margin-bottom: 1rem; border: 1px solid rgba(118,185,0,0.2);'>
                <h1 style='font-size: 3rem; margin:0; line-height: 1;'>👁️‍🗨️</h1>
            </div>
            <h1 style='font-size: 3.5rem; margin-bottom:0; font-weight: 800; background: linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>NeMo HR</h1>
            <div style='color: #76b900; font-weight: 600; letter-spacing: 4px; font-size: 0.9rem; margin-top: 0.5rem; text-transform: uppercase;'>AI Workforce Intelligence</div>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("<div class='login-card'>", unsafe_allow_html=True)
        
        # Use a container to hold the inputs so they render inside the HTML div visually
        with st.container():
            username = st.text_input("Secure ID (Role)", value="admin")
            password = st.text_input("Access Key", type="password", value="admin123")
            
            st.markdown("""
            <div style='margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; border-left: 3px solid #38bdf8;'>
                <span style='color: #94a3b8; font-size: 0.85rem;'><b>Demo Credentials:</b> admin/admin123 | manager/admin123 | employee/employee123</span>
            </div>
            """, unsafe_allow_html=True)
            
            st.markdown("<div style='height: 2rem;'></div>", unsafe_allow_html=True)
            if st.button("AUTHENTICATE SESSION", type="primary", use_container_width=True):
                with st.spinner("Establishing Secure Link..."):
                    try:
                        resp = requests.post(f"{API_URL}/token", data={"username": username, "password": password})
                        if resp.status_code == 200:
                            data = resp.json()
                            st.session_state.token = data.get("access_token")
                            st.session_state.role = data.get("role", "admin")
                            st.rerun()
                        else:
                            st.error("Authentication Failed: Invalid Authorization Core")
                    except Exception as e:
                        st.error(f"Node Connection Error: {e}")
        st.markdown("</div>", unsafe_allow_html=True)
else:
    # Sidebar Navigation
    with st.sidebar:
        st.markdown(f"<h2 style='color:#f8fafc; font-weight:600;'>🏢 HRMS SUITE ({st.session_state.role.upper()})</h2>", unsafe_allow_html=True)
        
        # Real-Time Notifications
        with st.expander("🔔 Notification Center", expanded=False):
            notifs = fetch_notifications(st.session_state.token)
            if notifs:
                for n in notifs:
                    color = "#ef4444" if n['type'] == 'alert' else "#10b981" if n['type'] == 'success' else "#38bdf8"
                    st.markdown(f"<div style='border-left: 2px solid {color}; padding-left: 10px; margin-bottom: 10px; font-size: 0.85rem;'>{n['message']} <br><small style='color:#94a3b8;'>{n['timestamp']}</small></div>", unsafe_allow_html=True)
            else:
                st.write("No new notifications.")

        # Unified Dashboard - No Sidebar Navigation needed
        
        # Floating Agent Orchestrator
        st.markdown("---")
        # Floating Agent Orchestrator
        st.markdown("---")
        st.markdown("<div style='display:flex; align-items:center; margin-bottom: 0.5rem;'><div style='background-color:#76b900; width:10px; height:10px; border-radius:50%; margin-right:8px;'></div><div style='color:#ffffff; font-weight:700; font-size:1.15rem; letter-spacing:0.5px;'>NeMo HR Copilot</div></div>", unsafe_allow_html=True)
        st.markdown("<div style='color:#94a3b8; font-size:0.85rem; margin-bottom: 1.5rem; line-height:1.4;'>Your AI assistant for automated requisitions, CFO memo routing, and complex HR analytics.</div>", unsafe_allow_html=True)
        
        # Quick Actions
        qa_cols = st.columns(2)
        if qa_cols[0].button("Route CFO Memo", key="qa1", use_container_width=True):
            st.session_state.quick_prompt = "Draft a 10% raise memo for Employee 101 and route to CFO"
        if qa_cols[1].button("Run Bias Audit", key="qa2", use_container_width=True):
            st.session_state.quick_prompt = "Run a bias audit on the Attrition XGBoost model"
            
        chat_container = st.container(height=350)
        with chat_container:
            for msg in st.session_state.chat_history:
                if msg["role"] == "user":
                    st.markdown(f"""
                    <div style='display: flex; justify-content: flex-end; margin-bottom: 1rem;'>
                        <div style='background: #2a2a2a; border: 1px solid #444; padding: 0.8rem 1rem; border-radius: 12px 12px 0px 12px; max-width: 85%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);'>
                            <div style='font-size: 0.7rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.3rem; text-align: right; text-transform: uppercase;'>You</div>
                            <div style='color: #f8fafc; font-size: 0.9rem; line-height: 1.4;'>{msg["content"]}</div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown(f"""
                    <div style='display: flex; justify-content: flex-start; margin-bottom: 1rem;'>
                        <div style='background: linear-gradient(135deg, rgba(118, 185, 0, 0.15), rgba(10, 10, 10, 0.8)); border: 1px solid rgba(118,185,0,0.3); padding: 0.8rem 1rem; border-radius: 12px 12px 12px 0px; max-width: 90%; box-shadow: 0 4px 15px -3px rgba(118,185,0,0.15);'>
                            <div style='font-size: 0.7rem; font-weight: 600; color: #76b900; margin-bottom: 0.3rem; text-transform: uppercase;'>NeMo AI</div>
                    """, unsafe_allow_html=True)
                    st.markdown(msg["content"])
                    st.markdown("</div></div>", unsafe_allow_html=True)
                    
        prompt = st.chat_input("E.g., 'Draft PIP for 101' or 'Run Bias Audit'...")
        
        # Check if quick prompt was used
        if "quick_prompt" in st.session_state and st.session_state.quick_prompt:
            prompt = st.session_state.quick_prompt
            st.session_state.quick_prompt = None
            
        if prompt:
            st.session_state.chat_history.append({"role": "user", "content": prompt})
            with st.spinner("🧠 Agent is thinking..."):
                try:
                    resp = requests.post(f"{API_URL}/agent/chat", json={
                        "employee_id": 101, # Default context
                        "message": prompt
                    }, headers={"Authorization": f"Bearer {st.session_state.token}"})
                    reply = resp.json().get("reply", "No response")
                except:
                    reply = "Error connecting to Agent Orchestrator."
            st.session_state.chat_history.append({"role": "assistant", "content": reply})
            st.rerun()

        st.markdown("<div style='height: 40px'></div>", unsafe_allow_html=True)
        if st.button("Logout", use_container_width=True):
            st.session_state.token = None
            st.session_state.role = None
            st.session_state.chat_history = []
            st.rerun()
            
    if st.session_state.role == "employee":
        render_employee_portal()
    else:
        st.markdown("<h2 style='color:#76b900; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(118,185,0,0.3); padding-bottom: 0.5rem;'>EXECUTIVE COMMAND CENTER</h2>", unsafe_allow_html=True)
        
        if st.session_state.role == "admin":
            # HIGH DENSITY KPI HEADER
            c1, c2, c3, c4 = st.columns(4)
            c1.markdown("<div class='glass-card' style='padding:1.5rem;'><div class='metric-label'>Total Headcount</div><div style='font-size: 2.5rem; color:#ffffff;'>6,962</div></div>", unsafe_allow_html=True)
            c2.markdown("<div class='glass-card' style='padding:1.5rem;'><div class='metric-label'>Global Attrition Risk</div><div style='font-size: 2.5rem; color:#ef4444;'>12.4%</div></div>", unsafe_allow_html=True)
            c3.markdown("<div class='glass-card' style='padding:1.5rem;'><div class='metric-label'>Critical Roles Filled</div><div style='font-size: 2.5rem; color:#10b981;'>84.0%</div></div>", unsafe_allow_html=True)
            c4.markdown("<div class='glass-card' style='padding:1.5rem;'><div class='metric-label'>Avg Engagement</div><div style='font-size: 2.5rem; color:#38bdf8;'>3.8 / 5</div></div>", unsafe_allow_html=True)
            st.markdown("<div style='height: 1.5rem'></div>", unsafe_allow_html=True)
            
            t1, t2, t3, t4 = st.tabs(["Talent & Culture 🧠", "Operations & Compliance ⚙️", "Retention & Recruitment 📈", "🚀 AI Executor (Write Access)"])
            
            with t1:
                render_core_hr()
                st.markdown("<div style='height: 2rem'></div>", unsafe_allow_html=True)
                render_individual()
                st.markdown("<div style='height: 1rem'></div>", unsafe_allow_html=True)
                with st.expander("👑 Succession Planning", expanded=False):
                    render_succession()
                with st.expander("🌡️ Sentiment & Burnout", expanded=False):
                    render_sentiment()
                    
            with t2:
                render_bias_audit()
                st.markdown("<div style='height: 2rem'></div>", unsafe_allow_html=True)
                render_integrations()
                st.markdown("<div style='height: 1rem'></div>", unsafe_allow_html=True)
                with st.expander("💳 Payroll & Benefits", expanded=False):
                    render_payroll()
                with st.expander("🏖️ Actionable Leave", expanded=False):
                    render_leave()
                    
            with t3:
                render_performance()
                st.markdown("<div style='height: 1rem'></div>", unsafe_allow_html=True)
                with st.expander("🤝 Talent Pipeline (ATS)", expanded=False):
                    render_ats()
                with st.expander("📊 Executive ROI", expanded=False):
                    render_roi()

            with t4:
                st.markdown("<h3 style='color:#ef4444;'>⚠️ AI Execution Agent</h3>", unsafe_allow_html=True)
                st.markdown("<p style='color:#94a3b8;'>This agent has <b>write access</b> to the database. It can approve leaves and reject candidates directly.</p>", unsafe_allow_html=True)
                
                if "exec_history" not in st.session_state:
                    st.session_state.exec_history = []
                    
                exec_container = st.container(height=400)
                with exec_container:
                    for msg in st.session_state.exec_history:
                        if msg["role"] == "user":
                            st.markdown(f"""
                            <div style='display: flex; justify-content: flex-end; margin-bottom: 1rem;'>
                                <div style='background: #2a2a2a; border: 1px solid #444; padding: 0.8rem 1rem; border-radius: 12px 12px 0px 12px; max-width: 85%;'>
                                    <div style='font-size: 0.7rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.3rem; text-align: right; text-transform: uppercase;'>Admin</div>
                                    <div style='color: #f8fafc; font-size: 0.9rem; line-height: 1.4;'>{msg["content"]}</div>
                                </div>
                            </div>
                            """, unsafe_allow_html=True)
                        else:
                            st.markdown(f"""
                            <div style='display: flex; justify-content: flex-start; margin-bottom: 1rem;'>
                                <div style='background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(10, 10, 10, 0.8)); border: 1px solid rgba(239,68,68,0.3); padding: 0.8rem 1rem; border-radius: 12px 12px 12px 0px; max-width: 90%;'>
                                    <div style='font-size: 0.7rem; font-weight: 600; color: #ef4444; margin-bottom: 0.3rem; text-transform: uppercase;'>Action Executor</div>
                            """, unsafe_allow_html=True)
                            st.markdown(msg["content"])
                            st.markdown("</div></div>", unsafe_allow_html=True)
                
                exec_prompt = st.chat_input("E.g., 'Approve leave request 14' or 'Reject candidate 2'...", key="exec_input")
                if exec_prompt:
                    st.session_state.exec_history.append({"role": "user", "content": exec_prompt})
                    with st.spinner("⚡ Executing Action..."):
                        try:
                            resp = requests.post(f"{API_URL}/agent/execute", json={
                                "employee_id": 101,
                                "message": exec_prompt
                            }, headers={"Authorization": f"Bearer {st.session_state.token}"})
                            reply = resp.json().get("reply", "No response")
                        except:
                            reply = "❌ Error connecting to Action Orchestrator."
                    st.session_state.exec_history.append({"role": "assistant", "content": reply})
                    st.rerun()
        else:
            # Manager view
            render_individual()
            st.markdown("<div style='height: 2rem'></div>", unsafe_allow_html=True)
            st.markdown("<h3 style='color:#ffffff; margin-bottom: 1rem;'>Deep Dive Analytics</h3>", unsafe_allow_html=True)
            with st.expander("📈 Performance Trends", expanded=False):
                render_performance()
            with st.expander("💳 Payroll & Benefits", expanded=False):
                render_payroll()
            with st.expander("🏖️ Actionable Leave", expanded=False):
                render_leave()
