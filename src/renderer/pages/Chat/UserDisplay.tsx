import { Avatar, Skeleton } from "@mui/material"
import { CSSProperties, useCallback, useEffect, useState } from "react"
import { chatAPI, getUserInfo } from "renderer/services/chat"
import { cached } from "renderer/utils/promiseCacher"
import styled from "styled-components"
import { Style } from "util"

const UserDisplayRow = styled.div`
    display: flex;
    flex-direction: row;
`

export const UserDisplay: React.FC<{userID: string; nameOnly?: boolean; nameStyle?: CSSProperties}> = (props) => {
    const [userInfo, setUserInfo] = useState<ChatAPI.User | null>(null)
    const fetchUser = useCallback(async () => {
        const info = await cached(props.userID, chatAPI, getUserInfo, props.userID)
        setUserInfo(info)
    }, [props.userID])
    useEffect(() => {
        fetchUser()
    }, [fetchUser])
    return <>
        {props.nameOnly && userInfo && <span style={props.nameStyle}>{userInfo.name}</span>}
        {!props.nameOnly && <UserDisplayRow>
            <Avatar src={userInfo?.image_url} style={{width: 24, height: 24, marginRight: 8}}/>
            {!userInfo && <Skeleton width={150} height={30}/>}
            {userInfo && <div style={props.nameStyle}>{userInfo.name}</div>}
            {/* <span style={{color: 'grey', fontSize: 10}}>{` # ${props.userID}`}</span> */}
        </UserDisplayRow>}
    </>
}
