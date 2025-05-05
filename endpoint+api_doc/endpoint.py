
"""
    Key pydantic model for reference
"""
class PostCreate(BaseModel):
    content: str
    platforms: List[str]
    schedule_time: datetime
    media_ids: List[str] = []
    hashtags: List[str] = []

class HashtagRequest(BaseModel):
    post_content: str
    platform: str

class EngagementMetrics(BaseModel):
    likes: int
    shares: int
    comments: int
    
# --------------------------
# Authentication
# --------------------------
@app.post("/auth/register")
async def register(user_data: UserRegister) -> UserResponse:
    """
    Input: {email: str, password: str, name: str}
    Output: {id: str, email: str, role: str}
    """
    pass

@app.post("/auth/login")
async def login(credentials: UserLogin) -> AuthToken:
    """
    Input: {email: str, password: str}
    Output: {access_token: str, refresh_token: str}
    """
    pass

@app.post("/auth/refresh-token")
async def refresh_token(refresh_data: RefreshRequest) -> AuthToken:
    """
    Input: {refresh_token: str}
    Output: {access_token: str}
    """
    pass

# --------------------------
# User Management
# --------------------------
@app.get("/users/me")
async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    """
    Input: JWT in header
    Output: {id: str, email: str, role: str, connected_accounts: List[str]}
    """
    pass

@app.post("/users/invite")
async def invite_user(invite_data: UserInvite, admin_token: str = Depends(admin_auth)) -> InviteResponse:
    """
    Input: {email: str, role: str} + Admin JWT
    Output: {invite_link: str}
    """
    pass

@app.get("/integrations/connect/{platform}")
async def connect_social_account(
    platform: str, 
    redirect_url: str = Query(...)
) -> RedirectResponse:
    """
    Input: platform (facebook|instagram|twitter), redirect_url
    Output: OAuth redirect to social platform
    """
    pass

@app.get("/integrations/callback/{platform}")
async def oauth_callback(
    platform: str, 
    code: str = Query(...), 
    state: str = Query(...)
) -> IntegrationStatus:
    """
    Input: OAuth code + state
    Output: {status: str, account_id: str, platform: str}
    """
    pass


@app.post("/posts/schedule")
async def schedule_post(
    post_data: PostCreate, 
    token: str = Depends(oauth2_scheme)
) -> ScheduledPostResponse:
    """
    Input: {
        content: str,
        platforms: List[str],
        schedule_time: datetime,
        media_ids: List[str],
        hashtags: List[str]
    }
    Output: {post_id: str, status: str, scheduled_at: datetime}
    """
    pass

@app.patch("/posts/{post_id}/reschedule")
async def reschedule_post(
    post_id: str, 
    new_time: datetime,
    token: str = Depends(oauth2_scheme)
) -> RescheduleResponse:
    """
    Input: {new_time: datetime}
    Output: {post_id: str, old_time: datetime, new_time: datetime}
    """
    pass


@app.get("/calendar")
async def get_calendar_view(
    start_date: date = Query(...),
    end_date: date = Query(...),
    token: str = Depends(oauth2_scheme)
) -> CalendarResponse:
    """
    Input: start_date, end_date
    Output: {
        dates: List[{
            date: date,
            posts: List[{
                id: str,
                time: datetime,
                platform: str,
                color_label: str
            }]
        }]
    }
    """
    pass

@app.post("/ai/hashtags")
async def generate_hashtags(
    content: HashtagRequest, 
    token: str = Depends(oauth2_scheme)
) -> HashtagResponse:
    """
    Input: {post_content: str, platform: str}
    Output: {hashtags: List[str], trending_score: float}
    """
    pass


@app.get("/analytics/engagement")
async def get_engagement_metrics(
    start_date: date = Query(...),
    end_date: date = Query(...),
    platform: str = Query(None),
    token: str = Depends(oauth2_scheme)
) -> EngagementResponse:
    """
    Input: start_date, end_date, platform(optional)
    Output: {
        total_likes: int,
        total_shares: int,
        platform_breakdown: Dict[str, EngagementMetrics]
    }
    """
    pass


@app.post("/team/members/{user_id}/roles")
async def update_user_role(
    user_id: str,
    role_data: RoleUpdate,
    admin_token: str = Depends(admin_auth)
) -> RoleResponse:
    """
    Input: {new_role: str}
    Output: {user_id: str, old_role: str, new_role: str}
    """
    pass

@app.get("/notifications/upcoming")
async def get_upcoming_notifications(
    hours_ahead: int = Query(24),
    token: str = Depends(oauth2_scheme)
) -> NotificationList:
    """
    Input: hours_ahead (optional)
    Output: List[{
        type: str, 
        post_id: str,
        scheduled_time: datetime,
        platform: str
    }]
    """
    pass

