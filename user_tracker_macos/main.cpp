/*******************************************************************************
*                                                                              
*   User Tracker openNI 2.0 for Google Map Dive
*   author: seb@seb.cc
*                                                                              
*******************************************************************************/

#include "NiTE.h"

#include "NiteSampleUtilities.h"

#include <errno.h>
#include <string.h>
#include <unistd.h>
#include <netdb.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <sys/uio.h>
#include <math.h>

// DEFAULTS
char hostname[255]="lg-head"; 
char portname[255]="12345";
float min_depth=0.0f;
float max_depth=10000.0f;

// UPD SOCKET
struct addrinfo hints;
struct addrinfo* res;
int fd;	

// USERS
#define MAX_USERS 10
bool g_visibleUsers[MAX_USERS] = {false};
nite::SkeletonState g_skeletonStates[MAX_USERS] = {nite::SKELETON_NONE};
float distance_users[MAX_USERS];

// MACRO
#define USER_MESSAGE(msg) \
	{printf("[%08llu] User #%d:\t%s\n",ts, user.getId(),msg);}
	
// SOCKET FUNCTIONS (SEB)
int initSocket() {

	// Read the configuration file
	FILE *configfile;
	char line[255];
	char *matchpt,*matchpt2;
	int matchpos;

	const char *cfgfile="usertracker.ini";
	if (! (configfile=fopen(cfgfile,"r")) ) {
		printf("Could not find usertracker.ini\n");
		return 2;
	}

	while (fgets(line,255,configfile)) {
		// Ignore comment lines
		if ( (strstr(line,"#")!=0) ) continue;
		// Process line key=value
		matchpt=strstr(line,"="); if (! matchpt) continue;
		matchpos=matchpt-line; line[matchpos]=0;  // null terminate the string at equal position, line now contains the key
		matchpt++; // advance one character after the =
		matchpt2=strstr(matchpt,"\x0A"); // look of CR
		if (matchpt2) matchpt2[0]=0; // null terminate if found				
		if (strcmp(line,"host")==0) strcpy(hostname,matchpt);
		else if (strcmp(line,"port")==0) strcpy(portname,matchpt);
		else if (strcmp(line,"min_depth")==0) min_depth=strtof(matchpt,NULL);
		else if (strcmp(line,"max_depth")==0) max_depth=strtof(matchpt,NULL);
	}

	fclose(configfile);
    
    printf("Config loaded host: %s port: %s min: %f max: %f\n",hostname,portname,min_depth,max_depth);
    
    memset(&hints,0,sizeof(hints));
    hints.ai_family=AF_INET;
    hints.ai_socktype=SOCK_DGRAM;
    hints.ai_protocol=IPPROTO_UDP;
    hints.ai_flags=AI_ADDRCONFIG;
    
    int err=getaddrinfo(hostname,portname,&hints,&res); // PUTS ADDR INFO INTO RES
    
    if (err!=0) {
        printf("INIT_SOCKET: failed to resolve remote socket address (err=%d)",err);
        return (err);
    }
    fd=socket(res->ai_family,res->ai_socktype,res->ai_protocol);
    if (fd==-1) {
        printf("INIT_SOCKET: %s",strerror(errno));
        return(errno);
    }
    
    printf("INIT_SOCKET ready, sending data to %s on port %s\n",hostname,portname);
    return(0);
}

void SendSocketData(const char *message) {
    if (sendto(fd,message,strlen(message),0,res->ai_addr,res->ai_addrlen)==-1) {
        printf("%s",strerror(errno));
    }
}
// END SOCKET FUNCTIONS


void updateUserState(const nite::UserData& user, unsigned long long ts)
{
	if (user.isNew()) {
		USER_MESSAGE("New")
		//SendSocketData("{\"status\":\"user_new\"}"); 
	} else if (user.isVisible() && !g_visibleUsers[user.getId()]) {
		USER_MESSAGE("Visible")
		//SendSocketData("{\"status\":\"user_visible\"}");
	} else if (!user.isVisible() && g_visibleUsers[user.getId()]) {
		USER_MESSAGE("Out of Scene") 
		//SendSocketData("{\"status\":\"user_outofscene\"}");
	} else if (user.isLost()) {
		USER_MESSAGE("Lost")
		//SendSocketData("{\"status\":\"user_lost\"}");
	}

	g_visibleUsers[user.getId()] = user.isVisible();

	if(g_skeletonStates[user.getId()] != user.getSkeleton().getState())
	{
		switch(g_skeletonStates[user.getId()] = user.getSkeleton().getState())
		{
		case nite::SKELETON_NONE:
			USER_MESSAGE("Stopped tracking.")
			//SendSocketData("{\"status\":\"stop_tracking\"}");
			break;
		case nite::SKELETON_CALIBRATING:
			USER_MESSAGE("Calibrating...")
			//SendSocketData("{\"status\":\"calibrating\"}");
			break;
		case nite::SKELETON_TRACKED:
			USER_MESSAGE("Tracking!")
			//SendSocketData("{\"status\":\"start_tracking\"}");
			break;
		case nite::SKELETON_CALIBRATION_ERROR_NOT_IN_POSE:
		case nite::SKELETON_CALIBRATION_ERROR_HANDS:
		case nite::SKELETON_CALIBRATION_ERROR_LEGS:
		case nite::SKELETON_CALIBRATION_ERROR_HEAD:
		case nite::SKELETON_CALIBRATION_ERROR_TORSO:
			USER_MESSAGE("Calibration Failed... :-|")
			//SendSocketData("{\"status\":\"calibration_failed\"}");
			break;
		}
	}
}

int main(int argc, char** argv)
{
	bool running=true;

	nite::UserTracker userTracker;
	nite::Status niteRc;

	nite::NiTE::initialize();
	
	if (initSocket()!=0) {
		printf("Couldn't initialize socket\n");
		return 2;
	}

	niteRc = userTracker.create();
	if (niteRc != nite::STATUS_OK)
	{
		printf("Couldn't create user tracker\n");
		return 3;
	}
	
	printf("\nOpenNI User Tracker\nStart moving around to get detected...\n");
	
	nite::UserTrackerFrameRef userTrackerFrame;
	
	while (running)
	{
		niteRc = userTracker.readFrame(&userTrackerFrame);
		if (niteRc != nite::STATUS_OK)
		{
			printf("Get next frame failed\n");
			continue;
		}

		const nite::Array<nite::UserData>& users = userTrackerFrame.getUsers();

		int closestUser=-1;
		float closestDistance=10000.0f;

		for (int i = 0; i < users.getSize(); ++i)
		{
			const nite::UserData& user = users[i];
			updateUserState(user,userTrackerFrame.getTimestamp());
			if (user.isNew())
			{
				userTracker.startSkeletonTracking(user.getId());
			}
			else if (user.getSkeleton().getState() == nite::SKELETON_TRACKED)
			{
				float dx,dy,dz,d;
				dx=user.getSkeleton().getJoint(nite::JOINT_TORSO).getPosition().x;
				dy=user.getSkeleton().getJoint(nite::JOINT_TORSO).getPosition().y;
				dz=user.getSkeleton().getJoint(nite::JOINT_TORSO).getPosition().z;
				d=sqrt(dx*dx+dy*dy+dz*dz);
				if (d<closestDistance) {
					closestDistance=d;
					closestUser=i;
				}

			}
		}

		if (closestUser!=-1) {
			const nite::UserData& user = users[closestUser];
			// SEND POSITION DATA                
            float speed=0;
            float direction=0;
            float dx,dy;
            float aleft,aright;
            
            dx=user.getSkeleton().getJoint(nite::JOINT_HEAD).getPosition().x - user.getSkeleton().getJoint(nite::JOINT_TORSO).getPosition().x;
            dy=user.getSkeleton().getJoint(nite::JOINT_HEAD).getPosition().y - user.getSkeleton().getJoint(nite::JOINT_TORSO).getPosition().y;
            direction=atan2(dy,dx);
            
            dx=user.getSkeleton().getJoint(nite::JOINT_LEFT_HAND).getPosition().x - user.getSkeleton().getJoint(nite::JOINT_LEFT_SHOULDER).getPosition().x;
            dy=user.getSkeleton().getJoint(nite::JOINT_LEFT_HAND).getPosition().y - user.getSkeleton().getJoint(nite::JOINT_LEFT_SHOULDER).getPosition().y;
            aleft=atan2(dy,dx);
            
            dx=user.getSkeleton().getJoint(nite::JOINT_RIGHT_HAND).getPosition().x - user.getSkeleton().getJoint(nite::JOINT_RIGHT_SHOULDER).getPosition().x;
            dy=user.getSkeleton().getJoint(nite::JOINT_RIGHT_HAND).getPosition().y - user.getSkeleton().getJoint(nite::JOINT_RIGHT_SHOULDER).getPosition().y;
            aright=atan2(dy,dx);
            
            char packet[1024];
            sprintf(packet,"{\"status\":\"tracking\",\"body\":%f,\"leftarm\":%f,\"rightarm\":%f}",direction,aleft,aright);
            SendSocketData(packet);
		} else {
			SendSocketData("{\"status\":\"no_user\"}");
		}

	}

	nite::NiTE::shutdown();
}
