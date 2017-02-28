# alioss-cli
> 快速上传文件至阿里云对象存储服务

## 安装
1. 下载项目

	```sh
		git clone git@192.168.1.216:yelo/alioss-cli.git && cd alioss-cli
		```

2. 安装依赖包

	```sh
		yarn
		```

3. 映射可执行文件

	```sh
		npm link
	```

## 如何使用
1. 为项目新建文件 *.aliossrc*，配置内容参考下一章节。
2. 进入项目目录，执行上传操作

	```sh
		alioss
		```

## 配置文件
配置文件的存放规则可以参考 [rc standards](https://github.com/dominictarr/rc#standards)，文件名为 *.aliossrc*。

建议在 **$HOME/.aliossrc** 存放敏感配置，如 accessKeyId、accessKeySecret、bucket、region；在项目内 **./.aliossrc** 存放项目相关的配置，如 prefix, cwd, patterns。


### 配置项
**accessKeyId**

oss 的 accessKeyId。


**accessKeySecret*

oss 的 accessKeySecret。


**bucket**

oss 的 bucket。


**region**

oss 的 region。如 ``oss-cn-hangzhou``。


**prefix**

上传至 oss 的目录前缀。如 ``/myproject/static/``。


**cwd**

上传文件的根路径。如 ``build/static``。


**patterns**

上传文件的匹配格式，使用 [glob 语法](https://github.com/isaacs/node-glob#glob-primer)。如全部文件 ``**/*``。


### 示例
完整的配置文件如下：
```
{
	"accessKeyId": "...",
	"accessKeySecret": "...",
	"bucket": "mybucket",
	"region": "oss-cn-hangzhou",
	"prefix": "/myproject/static/",
	"cwd": "build/static/",
	"patterns": "**/*"
}
```


## 最佳实践
文件结构：

```tree
		- ~
			- .aliossrc # 存放 oss 敏感信息，即 accessKeyId, accessKeySecret, bucket, region
			- ...
		- projects
			- myproject # 项目根目录
				- .aliossrc # 存放 prefix, cwd, patterns
				- ...
```

在每次发布过程中，待静态文件编译完成后，进入项目根目录执行 ``alioss``。

EOF
