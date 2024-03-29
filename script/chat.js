window.onload=function(){
	let congChat=new CongChat();
	congChat.init();
};
let CongChat=function(){
	
};
CongChat.prototype={
	init(){
		let infoMessage=document.getElementById('infoMessage'),
			loginArea=document.getElementById('loginArea'),
			that=this;
			this.users=[];
			this.nickname='';
			this.green=245;
			//头像预加载
		let img1=document.createElement('img'),
			img2=document.createElement('img'),
			img3=document.createElement('img');
			img1.src="./images/亚索.png";
			img2.src="./images/亚索2.png";
			img3.src="./images/timg.jpg";
		loginArea.classList.add('login-area-appear');
		this.socket=io.connect('http://169.254.35.97:3000/');
		this.socket.on('connect',function(){		
			infoMessage.classList.remove('error');
			infoMessage.classList.add('success');
			infoMessage.innerText="";
			if(localStorage.congChatNickname){
				document.getElementById('nicknameInput').value=localStorage.congChatNickname;
			}
		});
		this.socket.on('nickExisted',function(){
			infoMessage.classList.remove('success');
			infoMessage.classList.add('error');
			infoMessage.innerText="用户名已存在";
		});
		this.socket.on('loginSuccess',function(usersList,emojiArray){			
			infoMessage.classList.remove('error');
			infoMessage.classList.add('success');
			infoMessage.innerText="正在进入聊天.....";
			that.users=usersList;
			that.nickname=document.getElementById('nicknameInput').value.trim();
			localStorage.setItem('congChatNickname',that.nickname);
			that.showUserListInit(usersList,document.getElementById('nicknameInput').value.trim());
			loginArea.classList.remove('login-area-appear');
			document.getElementById('chatArea').classList.add('chat-area-show');
			setTimeout(function(){
				loginArea.style.display="none";
				let emojiArea=document.getElementById('emojiArea');
				emojiArray.forEach(function(item,index){
					let div=document.createElement('div'),
						img=document.createElement('img');
					div.classList.add('emojiContainerDiv');
					img.draggable=false;
					img.src="./images/chat-tool/emoji/"+item;
					img.title=item.split('.')[0];
					div.appendChild(img);
					emojiArea.appendChild(div);
				});//获取表情包
			},1000);

			
			that.socket.on('someoneLogout',function(nickname,users,type){//提示当前用户某些用户下线
			let li=document.createElement('div');
			li.innerHTML=`<div class="other-enter">
								<i class="other-nickname">${nickname}</i>离开了聊天
							</div>`;
			document.getElementById('messageList').appendChild(li);
			that.showUserListInit(users);
			that.scrollToDown(document.getElementById('messageShowContainer'));
			});

			that.socket.on('someoneLogin',function(nickname,users){//提示当前用户谁加入聊天
				let li=document.createElement('div');
				li.innerHTML=`<div class="other-enter">
									<i class="other-nickname">${nickname}</i>加入了聊天
								</div>`;
				document.getElementById('messageList').appendChild(li);
				that.showUserListInit(users);
				that.scrollToDown(document.getElementById('messageShowContainer'));
			});

			that.socket.on('someoneSendMessage',function(nickname,message){//接受信息
				let li=document.createElement('div');
				li.innerHTML=`<div class="message others">
									<div class="sender-photo">
										<div>
											<img src="./images/亚索.png" draggable="false" />
										</div>
									</div>
									<div class="sender-other">
										<div class="sender-name">${nickname}</div>
										<div class="single-message">${message}</div>
									</div>
								</div>`;
				document.getElementById('messageList').appendChild(li);
				that.scrollToDown(document.getElementById('messageShowContainer'));
			});

			that.socket.on('someoneSendEmoji',function(nickname,imgSrc){//接受表情包
				let li=document.createElement('div');
				li.innerHTML=`<div class="message others">
									<div class="sender-photo">
										<div>
											<img src="./images/亚索.png" draggable="false" />
										</div>
									</div>
									<div class="sender-other">
										<div class="sender-name">${nickname}</div>
										<img src="${imgSrc}" draggable="false" class="sendImage"/>
									</div>
								</div>`;
				document.getElementById('messageList').appendChild(li);
				that.scrollToDown(document.getElementById('messageShowContainer'));
			});
		});
		
		
		document.getElementById('joinChat').addEventListener('click',function(){//注册
			let nickname=document.getElementById('nicknameInput').value.trim();
			if(nickname!=""){
				infoMessage.classList.add('success');
				infoMessage.innerText="连接中。。。。。。";
				that.socket.emit('login',nickname);
			}else{
				document.getElementById('nicknameInput').focus();
			}
		},false);
		document.getElementById('sendMessageButton').addEventListener('click',function(){//发送信息
			that.sendMessage();
		},false);
		document.onkeydown=function(event){//回车发送
			let e=event||window.event;
			if(e.keyCode==13){
				that.sendMessage();
			}
		};
		document.getElementById('emojiArea').addEventListener('click',function(event){//发送表情包
			let e=event||window.event;
			let target=e.target;
			if(target.tagName.toLowerCase()=='img'){
				that.sendEmoji(that.nickname,target.src);
			}
			else if (target.tagName.toLowerCase()=='div'&&target.classList.contains('emojiContainerDiv')){
				that.sendEmoji(that.nickname,target.getElementsByTagName('img')[0].src);		
			}
			else{

			}
		});


		//工具栏
		document.getElementById('showEmojiArea').addEventListener('click',function(){//显示表情包
			let emojiArea=document.getElementById('emojiArea');
			emojiArea.classList.toggle('emoji-area-show');
		});
		document.getElementById('uploadPhotoButton').addEventListener('click',function(){//选择发送图片
			document.getElementById('realUploadPhoto').click();

		});
		document.getElementById('realUploadPhoto').addEventListener('change',function(){//发送图片
			if(this.files.length!=0){
				let file=this.files[0],
					reader=new FileReader();
				if(!reader){
					return;
				}
				reader.onload=function(e){
					this.value='';
					that.sendEmoji(that.nickname,e.target.result);	
				};
				reader.readAsDataURL(file);	
			}
		});
		document.getElementById('messageShowContainer').addEventListener('click',function(event){//放大图片
			let e=event||window.event,
				target=e.target;
			if(target.classList.contains('sendImage')){
				that.clickImage(target.src);
			}
		});
	},
	showUserListInit(users){
		let userList=document.getElementById('userList'),
			htmlStr="";
		users.forEach(function(item,index){
			htmlStr=htmlStr+`<li>
								<img src="./images/timg.jpg" draggable="false"  height="50px">
								<span>${item}</span>
							</li>`;
		});
		userList.innerHTML=htmlStr;
		document.getElementById('userNumber').innerText=users.length;
	},
	scrollToDown(dom){
		dom.scrollTop+=dom.scrollHeight;	
	},
	sendEmoji(nickname,src){//发送表情包
			this.socket.emit('sendEmoji',src);
			let li=document.createElement('div');
			li.innerHTML=`<div class="message your">								
								<div class="sender-other">
									<div class="sender-name">${nickname}</div>
									<img src="${src}" draggable="false" class="sendImage"/>
								</div>
								<div class="sender-photo">
									<div>
										<img src="./images/亚索2.png" draggable="false" />
									</div>
								</div>
					</div>`;
			document.getElementById('messageList').appendChild(li);
			document.getElementById('emojiArea').classList.remove('emoji-area-show');
			this.scrollToDown(document.getElementById('messageShowContainer'));
	},
	sendMessage(){//发送消息
		let message=document.getElementById('sendMessageContent').innerHTML.trim();
			if(message!=''){
				document.getElementById('sendMessageContent').innerHTML="";
				let li=document.createElement('div');
				this.socket.emit('sendMessage',message);
				li.innerHTML=`<div class="message your">								
									<div class="sender-other">
										<div class="sender-name">${this.nickname}</div>
										<div class="single-message">${message}</div>
									</div>
									<div class="sender-photo">
										<div>
											<img src="./images/亚索2.png" draggable="false" />
										</div>
									</div>
					</div>`;
				document.getElementById('messageList').appendChild(li);
				document.getElementById('sendMessageContent').focus();
				this.scrollToDown(document.getElementById('messageShowContainer'));		
			}
			else{
				alert('消息发送不能为空');
			}
	},
	clickImage(src){//单击图片变大
		document.getElementById('imageShowSrc').src=src;
		document.getElementById('imageClickShowArea').classList.remove('disappear');
		document.getElementById('imageClickShowArea').onclick=function(){
			document.getElementById('imageClickShowArea').classList.add('disappear');
		}
	}
}