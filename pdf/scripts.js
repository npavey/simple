(function () {
	"use strict";

	var defaultLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAkCAYAAADM3nVnAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0Q0QUUyOEQxOTdGMTFFNUJCRkQ4NUNDQzcyRUM5MDQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0Q0QUUyOEUxOTdGMTFFNUJCRkQ4NUNDQzcyRUM5MDQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozRDRBRTI4QjE5N0YxMUU1QkJGRDg1Q0NDNzJFQzkwNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozRDRBRTI4QzE5N0YxMUU1QkJGRDg1Q0NDNzJFQzkwNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pp1+ISUAABYFSURBVHja7FwJmBXVlT73VtVbuvt1N90NQtMtDYKAQQmKQUXFHRww0c+JJnGLS8zEGfcZx8RvkmjULzqJTogZJyZjjMY1GHedmGicDE5AxX0hURGkWZre316vljvn1jtF366u9/o1kBH1Hb5D1Xu13br3/Gd/zTZMOhN2gMYjH4i8J3IzchRZIGeRe5E7kdcir4ddSO2sAR511sK55u+gkQHo8PGmdBqgpSUO1958C24n4OcUVGn3orHK2GTkZcizCCR5YkcBzt7IEeQk8jri55G3Vae7Sp9kgCxAPhe5hoR9AzIvca6ge0uw7I98FPITyM8iF6rTXqWPC/EKz1uEfBGySW6TOcq1jKxKH50v909H/g5yR3Xaq/RJAsh05L9D7ia3SduBZ8jY5EPkFgLJsdWpr9InASDy+JeQM8R8B5/DiHuQZSR6GvLSHbmRhkNg1XWr0m4CkOOQ5yB37QQ4gs+TAJGZrnOQjxnrDSz01tzqulVpNwCIgXw4aX22i58pY5gPkM9CPqCSi2TUz5gOG9wBSIqPf4q3Sh8PKidnrchNyIO7GCC+y2WSNTkb+W3knNAEaCkNjEGj5HA3NidBaISYKlXpIwTIbCimdPt2KUBccJnDbNw6DNhmwcQUoYul+IQV8c44mM0m9JzcA9zER7pDj40bOrxr9sPqlzqh0ST7VqVPKx1IKvKljxIg00nL7zQ4EBAOz/IUbi035saRa4Qh6rw7u5DGY8cYvcZDyQVJ58NrNkDy8KRnSdRgIzHOgC2dWehelIU66fSNq0rJp5SehmIW9JaPEiCydWQCFNOzO+JAMWkptLQ2yGxWcGvcWnOKOaMwubCX1WK1IUQSIiJi3nkC7MimiGG3WIkN1284za1zIfZBDNCyDIMmR78qPhCBGG6z3KmKyaeXDqftKx+lixWHYruIO0ZgcHDA0gf1fnSbNHOaOctsN2dazXarNbHQgZYDEDBFdlgx9sZds60A+Vm5r3CTzzf6jMvxqY+zgOESBRyQpoGOIxblR1VPDljvGEaeoG0lzVAyyTCXnrEedqKFhuMr5nM5sCwLOOfBGK2uwvEE3yOHbP8/yE5iB8YH9F4WeSdhaycpWeZ6WY9rQ37rrzxOSXvwMkH02CwG/tOSWq+W1dL5vfKzB44fOL1vWd/Z6fnpQwqtZgcKf0Hv03PoOuU4/mMFJjnPTJbjFstFN0SzeHxvN+I+hnf8QvARRoRDqt+CbAYD+fD442jkJympIJ0w2QP2j2VGfQjyrVDMpiWJpcku1735PVqgl5FXQzH9/Uco1nV8Woh8CfKJJe6xGHkZ4mFqGkEfi8ehoaHRAwkU0953k5DL8WxF/hndawnyCnrutMA9z6GxJ0n4fgPF7ocg7YP8Y+TXlCjuMhI22Tr0EBRbikpRB/JNUKyJyWfJptTvUjInSCfQOH5Jn4+kMcr53iMwXz+h7weJ5TueF7ifrMfdB8Vis6QbkG9HfgD5sMC5U5FvJOWVpHvKZ8wp8V4X0DO/Tp8vpHd7g5Xo5m1AvhI5BsVmxHL6lKOgFxAcPYXWQkf64PSS/LS8bGaUcYQsW1jAygMOwcOcWsftPn1b2mlwWnjeU6efQ35xO5Q7YvDc/dvg+nPfhXGoZ/jwer4UyJtpXy50Gvkz9PlFMsv+e0jXcRVNok9WIOyXQPh2YJi/g6G6zX8h99Piyo7mTaTVJP0Zij1oEqB7hQjNo3LHtuGzyTS89u1rvwlHHLsEtmzqvIIxdoNybl8JwQNSII/SvlQoy2j/A8o+RunzxcjLleuOQP4D7V8PxQ6JsGccR+8bTNqowFoPQ21DffSuA8r5vyLFIS35XbRGQILXjjwR+Tnkmco1dsCrUcd/J/IZJeZjHvKrtC/X/Q1FyXcqawM0V08Eru8iuVhB63YFff+nUhZENhQ64NdJXGYLS0sLUx8g7hem0S/3IWlsEWgbBg5LL+45tffi/F65WQiMgjagZdFVskcDR9F/oidx73/fZblj2Cl4DufMO0EMT/EuVMBxNi3aHMp0DNL2IuX8PAlFP02W7FCuJc10N51zamCEX1XAIbX58chfQZ6CfDAJlE/fp+0kGFlnOoe2H/am4LVFi+bC0UuWQndX12EKOG6j7GEzCdLz/mKR5ahXwHEDvUMfCck0uvZqOv4juo9Pz5F1lfQtUgxfRJ5B75dSFIRKskv7BQLHA+R+T6W5Xkvz+cvANSto20zgkIA7RZnHDMnYRprTyTT2cQqIr1bm8Bt0jj/+v6VxNSrgkOP6bwLHw3SvdnKz7qNzHicXWaWHlHtKcPwA+W+QT9advtrhnpUUvoiT43GzDyNljuAYYBG7Xkvk95Rb0ESEcTciUFaZCw7P8MHctMI+5udy+wv5dUrPgOvyioCxXW9grG64IKIYo7hMI60j3YHLkX/ojUxmfV3hBUWMjTCPQO6VCippzq9F/lcoFiRvVPzbqbQ4qq8rn3kNab0mmmQfiksUxfFIYPSrAp+l5vwpxXHHK9oqQZMux/+QROmk9ilgGAZaE+tUVnwpi7RmXtF+K0gJHEwC7AtxDbkCkv5eERKX3J6TSVF81Z9DJc5qoXEfrHz/HvKDdH5t4J0uo9ghSa6OUKz1dWQhPk/CuDEknvspWSsIjGNfupeq8gbIHTqSPJkGUmZ+u5OtWMuewD2vIEDKc85XLJr0KL5M69hI86a6cIPK/ndIDopBet1R7yj4KEa/1sZmsLoa1mm15lG8MRvldfk2HrHHgeZGKeJAXY56HC2Lk3CbIlEBe7yhgRkv2KlmQzNrNFe3XFZRMQ/1g5blLDvBcu0Gx9UHdK4kB77mL24u5UDrtBi0NHPIJl2I121PMvg9XfeH3H2l4ntPUKxTf0jgyBXfPpgm26BoKKnV/gN5S4k3ssitO4TG/4RilSLezR1YLtEzsbUNCoUCAobFlOcGXVo14D6INKAfy8Rp/+GQcTxFAFmkAIQpGvmRkGt8gQsG0J+l7TMwskT7KwKI78LdpfgFoFirMHJLrEOLMpeqOtSU8Ycl+k+m7RqKFYP0KMWYc0vE3GkVHEWAHPn2MF+HcQHoTh2YXTP1EquzaaHWkMsJmxeEw/Pg6H5dRDAL8nadaLF0RIuJF3IQ8bStxzOO3j8xYqUbDUsvuHyU4B4wVGdu3BXpBSnTy2y5BMGitphBvu87tiUgntAwWMdThkRmT9IwQC92ofKygkywGmCqGScJmEvJukwKjCwZWOCbSIvqFJv8C2nsP5Br8Xrg+nsJIJ9Xsii+tl7purBOqv82tCC2bfvW71yK+S6kQBoC1gvIfVADbjU+yijvLoE2n/anlRCG5pAViYQItyqMCyj+YoqARwLBcViip4HcwDBqIwt4JsVPKmVLZLvKZch86xJGf6btTLLA2cBYR2TPAi6WNzWXIyjOMSb311ubmrrcnOEEM64MA28nLhrsOreJ23gF/kOXC+wIF9wRrGmzGXEZE9kGDSElSjtbsqeqz+ADy/ry+el52+g2NOXcLJn6ZUWAuFDXaEDTxAh0bc37PoA6+CnEEGLKg3QR+dn1il8qg87pJJBWSBC3P7lri2lC5xFfRr7+Jcr5dxCoDALJ3Uqm5VZNK0rzu2vfhvkHSRx52Z4byUVYToIor90Pir/e9C1QKpCK9+nQMho6N6Z8ZOm0P5AAt4Yc9+NVd4zlhLPJGvslhcfIWs8na2mGrEUlZYtShbKM4u42htT5NBpLodTAr8MputzNRdYw3elihjNdOBrHfVeZcltooNv17gSqhA/TNq7GhPTU6vssI1+rObJvirnhS2F0GTw/I2cnFyVNLa3xYkfiiDO9ZkbLdKF5UgzGt0Xh1VfyaqbHp38iX7cU+YIyiwTadw/OVDTmXAJIWB3hDTq2F43pKMpKtVLc8L8UwPqm+l669540zzN8N0XWcuQJb73+qheQMAz1hHD/mUD674G08SoCzQNlgH84aUcjpGYzFg0MowjWgxQsGyErxQO+/Gi0gNK0ku4JvPNpBBBrjABxlPisHIBM5Z0qLhReSoHNamFrjlafs7Vx6YzV2TyOJZy8V9IrhimunXAnoOAzr6MqbJQRJiJ5l9UmbT3VpNt6QbBhOgrFMbI5oklwdJ+zLSOr5lpGY4GcD1MyKF5xMFrDoaUthtI76N9nk5JuTFdYEPLz2h+GpA07FN+3FL1PLAX2m6TxEhSEqkL8C3qWtDxX0XdvSmtkIr6bcPyLjjkOgW9KcPhW4FSKba4m4Sk3DrWS/OpOFMMqIT82iZXw7XeELlDcmtMCxyYrSRFRJvdZylvYu8Q1vgv4bqVg5oqWvooyGXYRDAyiHT29zLAdsItVB+lauXFRj+5VHbPLhOBC+mE4mxk0P05x3/sa4xue40yCIzMvbXWd15WR8YeWHAGOML8Y4yMGiSYjaGj8oPUfKlyY6bQNq4BHSwSPpaifinkAI39r/5KSOvyuknaFLoTyF046Cpae+EXo3ia9N8/V+x8KqAfIEvq1mVK/4HxGWeRvwF+X/Hc5VhHenaUaxdqWcum0MjI7EHLscaUWsmeZIH5tpYP0H3YemZys/x3GHoY2Ppk22vr6nUws6nVNyQ4RjD3KIHjIiuCryUwWMhfodsnO3Mi2CEdgQT/GHN1noeXQhdB7dT7KT7G2PyebtGH2gnpoRrEpDHnWtymTskLx2YGyOHdS6g4ULQ6UYjxE+V4G0T9TLInqrlxDQhusMi9RXKdbA8fSgWJbnlwJz3+L19V7lkMUizo2WSW/IOenPgt07BmlhqK6E8uVesj5AbdnMWWUZu8CYb6F0uBSWT1NsZdPLZSl+jcY2890+pR60WLl+/0VhbJHIOYRihILi7t+oADntkCM+hMqToLiYlcEkPmUn18/rLAlrYCla9HpXd1aIpcX6YgmIiKKQh1hbgUJXCZjEbQYuLzagM71pMZzs3J219e6sv0n9Od5VmPaoMblb0BGoe0aJt1vQcecOmifHoFUblhscDpNntQQ75D7tI2OnREwub9QrMXzlB5+kmIIRs8bTzGET2eRAK4id+NpSiU+RcfvLJE2vSOQDs3KHgGvGrp1C+SyWdA0zU9ITKdMlhzfs/SsN+m9ZLzzn4HsFlBG7WGl1jBI2r6fsk2nw8g/klEfEuQHNXciRJgPJeGT2bOXCdAvk8t1Hc1RvIT7HqYCf0wKgNFY76H3XkOeTCe5dMsDSYe1ipA/Tin1U5R6xmJSHotpLVdRkuUCpXSwMjCWWIn39ga+lLSlHYwARN4weLxg1Sx4bx0G6padjTWiQDMvbzVaLkRmeJMRpvfovDDZdLrP2JbtOm9rptBecIytBmcmY6NYDlfxr4s+TN6F8e0x+MyhjZ6zqfT33U2a8uek6dpJyGUN4piAj7uRrMeT9PkUKujdQZmNE8gv/qNyzTzS4CspPXosabo3qHB2Vol3+LXiej3rOdx45+mTEnDa2edDLpcF13V9n/sAijvkc44mi7YvacGHFTcyGnjGSVTce4EW+AB6j9tJMTwV4hZCiSA1E1I4A8UtmUFaupfSx/NImGWSoikQB1kEbqeEy/omWf1n6POXqTh4Lz3nBPp+deC6E2Gok2ApKXj1uS/Q9XcoyYAJlCFbSDISJLPUnLDUlVPvpXRieFeqLJnX5k2nvzaa6mydbw/U1nHpG0SlaRBD9WYvz8u9qjg4nLGYJfTmFHywBDJdh1s5Tbc8SyI7eSussdeSRppBi+C1mMgs1jurk3DVSW+CLoP9eOi1CXrZ0WKJibSwmwM+bTOU7gauo+tSpJnK0Tg6xyB3YdsWFM8lR+8P3/7+j2DLJr/oDL8nUFxO6eEgzSEwAgy1yYTReNLcW8u4wBMJZAMhQGhQ0p/dFcydVWae/J9MuDQH9ij3aqGERyoQL75X4ppWetcPR6mLjKd79pQ5r4nOy5ECFaoZbCqbK5fhA8YgekM2q3dsyDmdLXVsW1SIdJRBXiv+6o/LggZyYx5YbUFAjSWMhgzY7Tl34LBEnjkR0PuNYqxRGTgcAscj6gTJboz+rgLMmJeAmXNi8MqLeWgJB0ilGZ2tSpCtUu8oLt97Fd5/OYHjdl8ByRdrbe9A12qY+WxU/OowgHxLqQ2N1gpeyTuXosExpGq3jnLchKG2kx1dh3LzvLmC+6ZLJAHC4qG+cmne8mLLMJRMRzjUcmCze4BNYw5LR5jI6syzGmhJWMSRwEC9gSKguyK6TehdTYlCTsTdeNrRxvA3URzStlJLfn3EQbtYUZ+ybwJWv5iH3ZiOphgAyDIMTbquAxveUHYXuUYnUSz4cxKYFnKf/I7Xa6F0EexTTC6KaAyY0wCCp0Bo6DwIbZfc2TfH06H8H2fA5RSOnoVeMxYZDzYGGDFbeNaCU07XLbpYwtShdqujp5p1e8N+8ayRdyuFht/TuwdpnyPCXBjpZumI1abW6O76539kpue3NH5JFwZTko7j+NkrUALO9QQA6U4Fu2llC/aVFNNUaZhkusCtFgRGFvLjVoCRWQBaYRK4Rs8uAYlOgewyWqCSlsTVWCyacTeadbzDjvCYZgkLLD4iOK8ZdDSzlrtrF9albDQy8ZTLBRs1GDdgqN/n92Q51pVAKrhorAo5d3f9A3LS15YtL2+TUD9W4XWPEM+lzFMdBfgym/OnKhLCrEYcuDkJ7PhbkGu+B+ya18CO/QVquy5GkLSBY2whvct2CiC/pkzOQZSp0ErE6jp3Rba2z34l3azPcwwW4yioCGD5gyhAwLBo2uWpFt1+Z1FdKj1Ot2sRLGXAYVB6zc/KvE+1hB9+7FduZIPgWOg14iqpzoVAtxRFU3jAMIA7jeDqA2A2PgVmw+O43w9abhY4kQ2QmXgzxHu/BFp+FrlcqYoiiVIAkRC7lFJne5OghsFOoBWp0U3R39BlP59t0GZacTbBibAIAgN0S8DG/eKwfm4NDhZqEBxMsO1uE4Pw/h05clmLkEWc31QFoUql4gtAUAieQ4Vc3Jo1r0IhsRKc6F8w9mgEXmj1Wj24NREtx2ZIT7wJoskjIZI60vsOZOsHAkW2oSup14oAApRtkPUCWZE9mTIlPZQBcIeBRGcJtBp6XZ89gC5UXLOhZ8ve0TXvz6+pzTbqMxEoDbG0G5UWh0ZiE8t7bSEAyuLOK5TW21gVgiqFxxcOynWjB5Bc811gR9d5lkMKumOg2IgICv/k7ef6W25jTMLyaFmeBqvmddDz+4CRnYMgasfDCQ8Y0gq5Goo5K0C5PzCqVjtlalO2nMj2CNmCsQ/50lHF7ZKjyAkOmx3O1nAb3qzpth9ML6jp6e6IQHOnFWUC6hEcNYrFkODIE+gy1VWvUuXxN4oRavxc831QqFuJn+Pg6L2eNeH2eBj+o8+g1YngpRO94L2QeAas2lUIkDa8bhwCLI2gmY3WZaHnsoW3m48EiE/3EzdQRqWdAkaXBFxqfdkN2YtAATfKPPcKrYa8Vv76o7u6tFXaBfDwtH2+aQXk638LujmNNL0YHpsM0TQl47f9uASVBzT5R8+NTeiSfeDtWzVrvGOR1GEYEpSuIf6fAAMA9GLFnhBY4zQAAAAASUVORK5CYII=';

	var imagesCounter = 0;
	var imagesPromises = [];
	var singleSelectImagesCounter = 0;

	$.loadImage = function (url) {
		var defer = $.Deferred();
		var image = new Image();

		function cleanUp() {
			image.onload = image.onerror = null;
		}
		defer.then(cleanUp, cleanUp);
		image.onload = image.onerror = defer.resolve;
		image.src = url;
		return defer.promise();
	}

	ko.bindingHandlers.loadHtml = {
		init: function (element, valueAccessor) {
			var html = valueAccessor();

			var $output = $('<output>');
			$output.html(html);
			wrapElement($output);
			buildLinearSelects($output);

			$(element).html($output.html());

			$('.spot', element).remove();

			function wrapElement($element) {
				var imageWrapper = '<figure class="image-wrapper"></figure>',
					tableWrapper = '<figure class="table-wrapper"></figure>';

				$('img', $element).each(function (index, image) {
					var $image = $(image),
						$wrapper = $(imageWrapper).css('float', $image.css('float'));
					$(image).css('float', 'none');
					$(image).css('height', 'auto');
					$image.wrap($wrapper);
					imagesPromises.push($.loadImage(image.src));
				});

				$('table', $element).each(function (index, table) {
					var $table = $(table),
						$wrapper = $(tableWrapper).css('text-align', $table.attr('align'));
					$table.attr('align', 'center').width('auto');
					$table.wrap($wrapper);
				});

				$('iframe', $element).each(function (index, iframe) {
					var $link = $('<a>').attr({
						href: iframe.src,
						target: '_blank'
					}).text(iframe.src);
					$(iframe).replaceWith($link);
				});
			}

			function buildLinearSelects($element) {
				$('select.blankSelect', $element).each(function (index, select) {
					var $linearSelect = $('<div>').addClass('linear-select');
					$('option', select).each(function (index, option) {
						$linearSelect.append($('<span>').text(option.innerText));
					});
					$(select).replaceWith($linearSelect);
				});
			}
		}
	};

	ConfigurationReader.read('../').then(function (configsFiles) {
		var configs = ConfigurationReader.init(configsFiles);
		TranslationPlugin.init(configs.translations);

		$.getJSON('../content/data.js', function (content) {
			var logoSettings = configs.templateSettings && configs.templateSettings.branding && configs.templateSettings.branding.logo;
			content.logo = {};
			content.logo.url = logoSettings && logoSettings.url ? logoSettings.url : defaultLogo;
			content.logo.maxWidth = logoSettings && logoSettings.maxWidth ? logoSettings.maxWidth : '300px';
			content.logo.maxHeight = logoSettings && logoSettings.maxHeight ? logoSettings.maxHeight : '100px';
			content.filterQuestionTypes = filterQuestionTypes;
			content.shuffleKeyValues = shuffleKeyValues;
			content.shuffle = shuffle;
			content.isLogoUploaded = ko.observable(false);
			content.isAvatarUploaded = ko.observable(false);
			content.logoUploaded = function () {
				content.isLogoUploaded(true);
			};
			content.avatarUploaded = function () {
				content.isAvatarUploaded(true);
			};
			content.isSingleSelectImageAnswersLoaded = ko.observable(false);
			content.singleSelectImageAnswerLoaded = function () {
				singleSelectImagesCounter--;
				if (singleSelectImagesCounter === 0) {
					content.isSingleSelectImageAnswersLoaded(true);
				}
			};
			content.isContentsLoaded = ko.observable(false);
			
			content.isPageFullyLoaded = ko.computed(function () {
				if (content.isLogoUploaded() &&
					content.isAvatarUploaded() &&
					content.isContentsLoaded() &&
					content.isSingleSelectImageAnswersLoaded()) {
					pageFullyLoaded();
					return true;
				}
				return false;
			}, this);
			TranslationPlugin.localize();
			content.renderingFinished = function () {
				if (imagesCounter === 0) {
					content.isContentsLoaded(true);
				} else {
					$.when.apply($, imagesPromises).done(function () {
						content.isContentsLoaded(true);
					});
				}
			};
			$.when.apply($, loadContents(content, configs.templateSettings)).done(function () {
				ko.applyBindings(content);
			});
		});
	});

	function pageFullyLoaded() {
		window.status = 'READY';
		document.body.classList.add('page-loaded');
	}

	function loadContents(content, templateSettings) {
		var promises = [];
		content.allowAuthorsBio = templateSettings.allowAuthorsBio;
		if(!content.allowAuthorsBio){
			content.avatarUploaded();
		}
		if (content.hasIntroductionContent) {
			ko.utils.arrayForEach(content.introductions, function (introduction){
				promises.push($.get('../content/introduction/'+ introduction.id +'.html', function (response) {
					introduction.html = response;
					calcImages(response);
				}));
				ko.utils.arrayForEach(introduction.children, function (child) {
					promises.push($.get('../content/introduction'+ child.id +'.html', function (response) {
						child.html = response;
						calcImages(response);
					}));
				});
			});
		}
		ko.utils.arrayForEach(content.sections, function (section) {
			ko.utils.arrayForEach(section.questions, function (question) {
				ko.utils.arrayForEach(question.learningContents, function (learningContent) {
					promises.push($.get('../content/' + section.id + '/' + question.id + '/' + learningContent.id + '.html', function (response) {
						learningContent.html = response;
						calcImages(response);
					}));

					ko.utils.arrayForEach(learningContent.children, function (child) {
						promises.push($.get('../content/' + section.id + '/' + question.id + '/' + child.id + '.html', function (response) {
							child.html = response;
							calcImages(response);
						}));
					});
				});

				ko.utils.arrayForEach(question.questionInstructions, function (questionInstruction) {
					promises.push($.get('../content/' + section.id + '/' + question.id + '/' + questionInstruction.id + '.html', function (response) {
						questionInstruction.html = response;
						calcImages(response);
					}));

					ko.utils.arrayForEach(questionInstruction.children, function (child) {
						promises.push($.get('../content/' + section.id + '/' + question.id + '/' + child.id + '.html', function (response) {
							child.html = response;
							calcImages(response);
						}));
					});
				});

				if (question.type === 'fillInTheBlank' && question.hasContent) {
					promises.push($.get('../content/' + section.id + '/' + question.id + '/content.html', function (response) {
						question.content = response;
						calcImages(response);
					}));
				}
				if (question.type === 'singleSelectImage') {
					singleSelectImagesCounter += question.answers.length;
				}
			});
		});
		if(singleSelectImagesCounter === 0){
			content.isSingleSelectImageAnswersLoaded(true);
		}
		return promises;
	}

	function calcImages(html) {
		var $output = $('<output>');
		$output.html(html);
		$('img', $output).each(function (index, image) {
			imagesCounter++;
		});
	}

	function filterQuestionTypes(questionsArray) {
		var supportedQuestionTypes = [
			'informationContent',
			'singleSelectText',
			'multipleSelect',
			'singleSelectImage',
			'fillInTheBlank',
			'textMatching',
			'statement',
			'openQuestion',
			'rankingText'
		];

		var resultArray = [];

		questionsArray.forEach(function (item) {
			if (supportedQuestionTypes.indexOf(item.type) !== -1) {
				resultArray.push(item);
			}
		});

		return resultArray;
	}

	function shuffleKeyValues(array) {
		var result = [],
			values = [];

		array.forEach(function (item) {
			values.push(item.value);
		});

		values = shuffle(values);

		array.forEach(function (item, index) {
			result.push({
				key: item.key,
				value: values[index]
			});
		});

		return result;
	}

	function shuffle(arr) {
		for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
		return arr;
	}
})();