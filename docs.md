## picgo-plugin-gitea-uploader项目文档

### 功能介绍

一个PicGo插件，用于将图片上传至Gitea仓库。使用Gitea的Rest API实现上传的请求。

本插件支持两种不同的上传时机：

1. 和之前的一系列git仓库上传插件类似，当图片被导入PicGo时，立刻将每张图片作为一个commit，最终上传到仓库，将raw图片的URL交给用户。可以使用的接口如 https://docs.gitea.com/api/1.22/#tag/repository/operation/repoCreateFile 所示。
2. 当图片被导入PicGo时，先不commit，只根据URL规则构造出上传后raw图片的URL交给用户；后续用户会手动要求上传图片，此时将所有未上传的图片在同一个commit中提交，并上传到仓库。可以使用的接口如 https://docs.gitea.com/api/1.22/#tag/repository/operation/repoChangeFiles 所示。

### 插件实现

#### 用户可配置内容

除了常规的用于读写远程gitea仓库所需的URL、令牌等配置外，还需添加用于切换上传模式的配置，当处于手动上传图片模式时，还需要有一个供用户手动激活上传的按钮。

#### 已上传图片的展示列表

和其他的git仓库图床上传插件类似，提供已上传图片的展示。通过维护一个本地历史记录实现日期的记录，日期按导入PicGo的时间为准。

